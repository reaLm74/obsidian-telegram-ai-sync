import TelegramBot from "node-telegram-bot-api";
import { displayAndLogError } from "src/utils/logUtils";
import TelegramSyncPlugin from "src/main";

export interface OpenAIMessage {
	role: "system" | "user" | "assistant";
	content:
		| string
		| Array<{
				type: "text" | "image_url";
				text?: string;
				image_url?: {
					url: string;
					detail?: "low" | "high" | "auto";
				};
		  }>;
}

export interface OpenAIResponse {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: {
		index: number;
		message: OpenAIMessage;
		finish_reason: string;
	}[];
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
}

/**
 * Determines message content type for prompt selection
 */
export function getMessageContentType(msg: TelegramBot.Message): string {
	if (msg.voice || msg.video_note) return "voice";
	if (msg.photo) return "photo";
	if (msg.video) return "video";
	if (msg.audio) return "audio";
	if (msg.document) return "document";
	if (msg.text) return "text";
	return "unknown";
}

/**
 * Checks if error is temporary (retryable)
 */
function isRetryableError(error: any, status?: number): boolean {
	if (status) {
		// HTTP statuses that should be retried
		return [429, 500, 502, 503, 504].includes(status);
	}

	if (error instanceof Error) {
		const message = error.message.toLowerCase();
		return (
			message.includes("timeout") ||
			message.includes("network") ||
			message.includes("connection") ||
			message.includes("rate limit")
		);
	}

	return false;
}

/**
 * Delay with exponential backoff
 */
async function exponentialDelay(attempt: number, baseDelay: number): Promise<void> {
	const delay = baseDelay * Math.pow(2, attempt - 1);
	const jitter = Math.random() * 0.1 * delay; // 10% jitter
	await new Promise((resolve) => setTimeout(resolve, delay + jitter));
}

/**
 * Gets image URL from message for Vision API
 */
async function getImageUrl(plugin: TelegramSyncPlugin, msg: TelegramBot.Message): Promise<string | null> {
	if (!msg.photo || !plugin.bot) return null;

	try {
		// Take largest image
		const photo = msg.photo[msg.photo.length - 1];
		const fileLink = await plugin.bot.getFileLink(photo.file_id);
		return fileLink;
	} catch (error) {
		return null;
	}
}

/**
 * Creates messages for Vision API
 */
async function createVisionMessages(
	plugin: TelegramSyncPlugin,
	content: string,
	prompt: string,
	msg: TelegramBot.Message,
): Promise<OpenAIMessage[]> {
	const imageUrl = await getImageUrl(plugin, msg);

	if (!imageUrl) {
		// Fallback to regular text message
		return [
			{ role: "system", content: prompt },
			{ role: "user", content: content },
		];
	}

	return [
		{ role: "system", content: prompt },
		{
			role: "user",
			content: [
				{
					type: "text",
					text: content || "Analyze this image",
				},
				{
					type: "image_url",
					image_url: {
						url: imageUrl,
						detail: "high",
					},
				},
			],
		},
	];
}

/**
 * Sends request to OpenAI API for content processing
 */
export async function processWithOpenAI(
	plugin: TelegramSyncPlugin,
	content: string,
	prompt: string,
	msg?: TelegramBot.Message,
): Promise<string | null> {
	if (!plugin.settings.aiEnabled || !prompt) {
		return null;
	}

	if (!plugin.settings.openAIApiKey) {
		const errorMsg = "OpenAI API key not set. " + "Specify it in plugin settings.";
		await displayAndLogError(plugin, new Error(errorMsg), "AI Processing Error", "", msg, 0);
		return null;
	}

	if (!content || content.trim().length === 0) {
		return null;
	}

	const maxAttempts = plugin.settings.aiRetryAttempts || 3;
	const baseDelay = plugin.settings.aiRetryDelay || 1000;
	const timeout = plugin.settings.aiTimeout || 30000;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			// Determine if Vision API should be used
			const contentType = msg ? getMessageContentType(msg) : "text";
			const useVision = plugin.settings.aiVisionEnabled && contentType === "photo" && msg;

			let messages: OpenAIMessage[];
			let model = plugin.settings.openAIModel || "gpt-4o-mini";

			if (useVision) {
				messages = await createVisionMessages(plugin, content, prompt, msg);
				// Vision API needs model with image support
				if (model.includes("mini")) {
					model = "gpt-4o";
				}
			} else {
				messages = [
					{ role: "system", content: prompt },
					{ role: "user", content: content },
				];
			}

			const requestBody = {
				model: model,
				messages: messages,
				temperature: plugin.settings.openAITemperature !== undefined ? plugin.settings.openAITemperature : 0.7,
				max_tokens: plugin.settings.openAIMaxTokens || 2000,
			};

			// Create AbortController for timeout
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);

			try {
				const response = await fetch("https://api.openai.com/v1/chat/completions", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${plugin.settings.openAIApiKey}`,
					},
					body: JSON.stringify(requestBody),
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					let errorMessage = `HTTP ${response.status}`;
					let errorData: any = null;

					try {
						errorData = await response.json();
						errorMessage = errorData.error?.message || errorData.error?.type || errorMessage;
					} catch {
						errorMessage = await response.text();
					}

					// Check if request should be retried
					if (attempt < maxAttempts && isRetryableError(errorData, response.status)) {
						await exponentialDelay(attempt, baseDelay);
						continue;
					}

					throw new Error(`OpenAI API error: ${errorMessage}`);
				}

				const data: OpenAIResponse = await response.json();

				if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
					throw new Error("OpenAI API returned empty response");
				}

				const result =
					typeof data.choices[0].message.content === "string"
						? data.choices[0].message.content
						: JSON.stringify(data.choices[0].message.content);

				if (!result || result.trim().length === 0) {
					throw new Error("OpenAI API returned empty content");
				}

				return result;
			} catch (fetchError) {
				clearTimeout(timeoutId);

				// If this is cancellation error (timeout)
				if (fetchError.name === "AbortError") {
					if (attempt < maxAttempts) {
						await exponentialDelay(attempt, baseDelay);
						continue;
					}
					throw new Error("OpenAI API request timeout");
				}

				throw fetchError;
			}
		} catch (error) {
			// If this is last attempt or error is not retryable
			if (attempt === maxAttempts || !isRetryableError(error)) {
				const errorMessage = error instanceof Error ? error.message : String(error);

				await displayAndLogError(
					plugin,
					new Error(
						`Error processing with OpenAI ` + `(attempt ${attempt}/${maxAttempts}): ` + `${errorMessage}`,
					),
					"AI Processing Failed",
					"Message will be saved without AI processing",
					msg,
					0,
				);
				return null;
			}

			// Wait before retry
			await exponentialDelay(attempt, baseDelay);
		}
	}

	return null;
}

/**
 * Gets prompt for specific content type
 */
export function getPromptForContentType(plugin: TelegramSyncPlugin, contentType: string): string {
	switch (contentType) {
		case "text":
			return plugin.settings.aiPromptText || "";
		case "voice":
			return plugin.settings.aiPromptVoice || "";
		case "photo":
			return plugin.settings.aiPromptPhoto || "";
		case "video":
			return plugin.settings.aiPromptVideo || "";
		case "audio":
			return plugin.settings.aiPromptAudio || "";
		case "document":
			return plugin.settings.aiPromptDocument || "";
		default:
			return "";
	}
}
