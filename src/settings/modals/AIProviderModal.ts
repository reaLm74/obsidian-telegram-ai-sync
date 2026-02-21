import { App, Modal, Notice, Setting } from "obsidian";
import TelegramSyncPlugin from "src/main";

export class AIProviderModal extends Modal {
	private plugin: TelegramSyncPlugin;
	private onUpdate: () => void;

	constructor(app: App, plugin: TelegramSyncPlugin, onUpdate?: () => void) {
		super(app);
		this.plugin = plugin;
		this.onUpdate = onUpdate || (() => {});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "AI Provider Settings" });

		// AI Provider Selection
		new Setting(contentEl)
			.setName("AI Provider")
			.setDesc("Choose which AI service to use")
			.addDropdown((dropdown) => {
				dropdown
					.addOption("openai", "OpenAI (ChatGPT)")
					.addOption("claude", "Anthropic Claude")
					.addOption("gemini", "Google Gemini")
					.setValue(this.plugin.settings.aiProvider || "openai")
					.onChange(async (value) => {
						this.plugin.settings.aiProvider = value as "openai" | "claude" | "gemini";
						await this.plugin.saveSettings();
						this.renderProviderSettings();
						this.onUpdate();
					});
			});

		const providerContainer = contentEl.createDiv({ cls: "ai-provider-container" });
		this.renderProviderSettings(providerContainer);

		// Advanced Settings Section
		contentEl.createEl("h3", { text: "Advanced Settings" });
		this.addAdvancedSettings(contentEl);

		// OK Button
		const buttonContainer = contentEl.createDiv({ cls: "modal-button-container" });
		buttonContainer.style.textAlign = "right";
		buttonContainer.style.marginTop = "20px";

		const okButton = buttonContainer.createEl("button", { text: "OK", cls: "mod-cta" });
		okButton.addEventListener("click", () => {
			this.close();
		});
	}

	private renderProviderSettings(container?: HTMLElement) {
		const providerContainer = container || (this.contentEl.querySelector(".ai-provider-container") as HTMLElement);
		if (!providerContainer) return;

		providerContainer.empty();

		const provider = this.plugin.settings.aiProvider || "openai";

		switch (provider) {
			case "openai":
				this.addOpenAISettings(providerContainer);
				break;
			case "claude":
				this.addClaudeSettings(providerContainer);
				break;
			case "gemini":
				this.addGeminiSettings(providerContainer);
				break;
		}
	}

	private addOpenAISettings(container: HTMLElement) {
		new Setting(container)
			.setName("OpenAI API Key")
			.setDesc("Your OpenAI API key")
			.addText((text) => {
				text.setPlaceholder("sk-...")
					.setValue(this.plugin.settings.openAIApiKey)
					.onChange(async (value) => {
						this.plugin.settings.openAIApiKey = value.trim();
						await this.plugin.saveSettings();
						this.onUpdate();
					});
				text.inputEl.type = "password";
				text.inputEl.style.width = "300px";
			})
			.addButton((button) => {
				button
					.setButtonText("Test Key")
					.setTooltip("Test API key validity")
					.onClick(async () => {
						button.setDisabled(true);
						button.setButtonText("Testing...");

						const { testOpenAIApiKey } = await import("src/ai/openai");
						const result = await testOpenAIApiKey(this.plugin.settings.openAIApiKey);

						button.setButtonText(result.success ? "✓" : "✗");
						button.setTooltip(result.message);

						// Show notification
						if (result.success) {
							new Notice(result.message);
						} else {
							new Notice(result.message, 5000);
						}

						// Reset button after 3 seconds
						setTimeout(() => {
							button.setButtonText("Test Key");
							button.setTooltip("Test API key validity");
							button.setDisabled(false);
						}, 3000);
					});
			});

		new Setting(container)
			.setName("Model")
			.setDesc("OpenAI model to use (e.g., gpt-4o, gpt-4o-mini)")
			.addText((text) => {
				text.setPlaceholder("gpt-4o-mini")
					.setValue(this.plugin.settings.openAIModel)
					.onChange(async (value) => {
						this.plugin.settings.openAIModel = value.trim();
						await this.plugin.saveSettings();
						this.onUpdate();
					});
			});

		new Setting(container)
			.setName("Enable Vision API")
			.setDesc("Use GPT-4 Vision for image analysis (requires compatible model)")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.aiVisionEnabled).onChange(async (value) => {
					this.plugin.settings.aiVisionEnabled = value;
					await this.plugin.saveSettings();
					this.onUpdate();
				});
			});

		new Setting(container)
			.setName("Temperature")
			.setDesc("Controls randomness (0-2). Lower = more focused, higher = more creative")
			.addSlider((slider) => {
				slider
					.setLimits(0, 2, 0.1)
					.setValue(this.plugin.settings.openAITemperature)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.openAITemperature = value;
						await this.plugin.saveSettings();
						this.onUpdate();
					});
			});

		new Setting(container)
			.setName("Max Tokens")
			.setDesc("Maximum length of the response")
			.addText((text) => {
				text.setPlaceholder("2000")
					.setValue(this.plugin.settings.openAIMaxTokens.toString())
					.onChange(async (value) => {
						const tokens = parseInt(value) || 2000;
						this.plugin.settings.openAIMaxTokens = tokens;
						await this.plugin.saveSettings();
						this.onUpdate();
					});
			});
	}

	private addClaudeSettings(container: HTMLElement) {
		new Setting(container)
			.setName("Claude API Key")
			.setDesc("Your Anthropic Claude API key")
			.addText((text) => {
				text.setPlaceholder("sk-ant-...")
					.setValue(this.plugin.settings.claudeApiKey)
					.onChange(async (value) => {
						this.plugin.settings.claudeApiKey = value.trim();
						await this.plugin.saveSettings();
						this.onUpdate();
					});
				text.inputEl.type = "password";
				text.inputEl.style.width = "300px";
			});

		new Setting(container)
			.setName("Claude Model")
			.setDesc(
				"Claude model to use (e.g., claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022, claude-3-opus-20240229)",
			)
			.addText((text) => {
				text.setPlaceholder("claude-3-5-sonnet-20241022")
					.setValue(this.plugin.settings.claudeModel || "claude-3-5-sonnet-20241022")
					.onChange(async (value) => {
						this.plugin.settings.claudeModel = value.trim();
						await this.plugin.saveSettings();
						this.onUpdate();
					});
			});

		new Setting(container)
			.setName("Temperature")
			.setDesc("Controls randomness (0-1). Lower = more focused, higher = more creative")
			.addSlider((slider) => {
				slider
					.setLimits(0, 1, 0.1)
					.setValue(this.plugin.settings.claudeTemperature)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.claudeTemperature = value;
						await this.plugin.saveSettings();
						this.onUpdate();
					});
			});

		new Setting(container)
			.setName("Max Tokens")
			.setDesc("Maximum length of the response")
			.addText((text) => {
				text.setPlaceholder("2000")
					.setValue(this.plugin.settings.claudeMaxTokens.toString())
					.onChange(async (value) => {
						const tokens = parseInt(value) || 2000;
						this.plugin.settings.claudeMaxTokens = tokens;
						await this.plugin.saveSettings();
						this.onUpdate();
					});
			});
	}

	private addGeminiSettings(container: HTMLElement) {
		new Setting(container)
			.setName("Gemini API Key")
			.setDesc("Your Google Gemini API key")
			.addText((text) => {
				text.setPlaceholder("AIza...")
					.setValue(this.plugin.settings.geminiApiKey)
					.onChange(async (value) => {
						this.plugin.settings.geminiApiKey = value.trim();
						await this.plugin.saveSettings();
						this.onUpdate();
					});
				text.inputEl.type = "password";
				text.inputEl.style.width = "300px";
			});

		new Setting(container)
			.setName("Gemini Model")
			.setDesc(
				"Gemini model to use for both text and images (e.g., gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash-exp)",
			)
			.addText((text) => {
				text.setPlaceholder("gemini-1.5-pro")
					.setValue(this.plugin.settings.geminiModel || "gemini-1.5-pro")
					.onChange(async (value) => {
						this.plugin.settings.geminiModel = value.trim();
						await this.plugin.saveSettings();
						this.onUpdate();
					});
			});

		new Setting(container)
			.setName("Enable Gemini Vision")
			.setDesc("Use the selected Gemini model for image analysis")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.geminiVisionEnabled).onChange(async (value) => {
					this.plugin.settings.geminiVisionEnabled = value;
					await this.plugin.saveSettings();
					this.onUpdate();
				});
			});

		new Setting(container)
			.setName("Temperature")
			.setDesc("Controls randomness (0-2). Lower = more focused, higher = more creative")
			.addSlider((slider) => {
				slider
					.setLimits(0, 2, 0.1)
					.setValue(this.plugin.settings.geminiTemperature)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.geminiTemperature = value;
						await this.plugin.saveSettings();
						this.onUpdate();
					});
			});

		new Setting(container)
			.setName("Max Tokens")
			.setDesc("Maximum length of the response")
			.addText((text) => {
				text.setPlaceholder("2000")
					.setValue(this.plugin.settings.geminiMaxTokens.toString())
					.onChange(async (value) => {
						const tokens = parseInt(value) || 2000;
						this.plugin.settings.geminiMaxTokens = tokens;
						await this.plugin.saveSettings();
						this.onUpdate();
					});
			});
	}

	private addAdvancedSettings(container: HTMLElement) {
		new Setting(container)
			.setName("Retry attempts")
			.setDesc("Number of retry attempts for failed requests")
			.addText((text) => {
				text.setPlaceholder("3")
					.setValue(this.plugin.settings.aiRetryAttempts.toString())
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num >= 0) {
							this.plugin.settings.aiRetryAttempts = num;
							await this.plugin.saveSettings();
							this.onUpdate();
						}
					});
			});

		new Setting(container)
			.setName("Retry delay (ms)")
			.setDesc("Base delay between retries (will increase exponentially)")
			.addText((text) => {
				text.setPlaceholder("1000")
					.setValue(this.plugin.settings.aiRetryDelay.toString())
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num > 0) {
							this.plugin.settings.aiRetryDelay = num;
							await this.plugin.saveSettings();
							this.onUpdate();
						}
					});
			});

		new Setting(container)
			.setName("Request timeout (ms)")
			.setDesc("Maximum time to wait for API response")
			.addText((text) => {
				text.setPlaceholder("30000")
					.setValue(this.plugin.settings.aiTimeout.toString())
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num > 0) {
							this.plugin.settings.aiTimeout = num;
							await this.plugin.saveSettings();
							this.onUpdate();
						}
					});
			});
	}

	onClose() {
		this.contentEl.empty();
	}
}
