import { App, Modal, Setting } from "obsidian";
import TelegramSyncPlugin from "src/main";

export class PromptsModal extends Modal {
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

		contentEl.createEl("h2", { text: "AI Prompts Configuration" });

		contentEl.createEl("p", {
			text: "Configure prompts for different content types. Each content type can have its own specific prompt for AI processing. Use checkboxes to enable/disable processing for each type.",
		});

		// General formatting prompt
		new Setting(contentEl)
			.setName("General Formatting Prompt")
			.setDesc(
				"Applied to all processed content for final formatting. Used when no specific prompt is set or as a final formatting step.",
			)
			.addTextArea((text) => {
				text.setPlaceholder("Format this content as a beautiful Markdown note...")
					.setValue(this.plugin.settings.aiPromptGeneral)
					.onChange(async (value) => {
						this.plugin.settings.aiPromptGeneral = value;
						await this.plugin.saveSettings();
						this.onUpdate();
					});
				text.inputEl.rows = 3;
				text.inputEl.style.width = "100%";
			});

		contentEl.createEl("hr");
		contentEl.createEl("h3", { text: "Content Type Specific Prompts" });

		// Text prompt
		new Setting(contentEl)
			.setName("Text Messages")
			.setDesc("Prompt for processing plain text messages")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.aiProcessText).onChange(async (value) => {
					this.plugin.settings.aiProcessText = value;
					await this.plugin.saveSettings();
					this.onUpdate();
				});
			})
			.addTextArea((text) => {
				text.setPlaceholder("Process this text message and format it as a note...")
					.setValue(this.plugin.settings.aiPromptText)
					.onChange(async (value) => {
						this.plugin.settings.aiPromptText = value;
						await this.plugin.saveSettings();
						this.onUpdate();
					});
				text.inputEl.rows = 3;
				text.inputEl.style.width = "100%";
			});

		// Voice prompt
		new Setting(contentEl)
			.setName("Voice Messages")
			.setDesc("Prompt for processing transcribed voice messages")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.aiProcessVoice).onChange(async (value) => {
					this.plugin.settings.aiProcessVoice = value;
					await this.plugin.saveSettings();
					this.onUpdate();
				});
			})
			.addTextArea((text) => {
				text.setPlaceholder("Process this voice transcript and format it as a note...")
					.setValue(this.plugin.settings.aiPromptVoice)
					.onChange(async (value) => {
						this.plugin.settings.aiPromptVoice = value;
						await this.plugin.saveSettings();
						this.onUpdate();
					});
				text.inputEl.rows = 3;
				text.inputEl.style.width = "100%";
			});

		// Photo prompt
		new Setting(contentEl)
			.setName("Photos")
			.setDesc("Prompt for processing images (requires Vision API)")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.aiProcessPhoto).onChange(async (value) => {
					this.plugin.settings.aiProcessPhoto = value;
					await this.plugin.saveSettings();
					this.onUpdate();
				});
			})
			.addTextArea((text) => {
				text.setPlaceholder("Analyze this image and create a descriptive note...")
					.setValue(this.plugin.settings.aiPromptPhoto)
					.onChange(async (value) => {
						this.plugin.settings.aiPromptPhoto = value;
						await this.plugin.saveSettings();
						this.onUpdate();
					});
				text.inputEl.rows = 3;
				text.inputEl.style.width = "100%";
			});

		// Video prompt
		new Setting(contentEl)
			.setName("Videos")
			.setDesc("Prompt for processing video files")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.aiProcessVideo).onChange(async (value) => {
					this.plugin.settings.aiProcessVideo = value;
					await this.plugin.saveSettings();
					this.onUpdate();
				});
			})
			.addTextArea((text) => {
				text.setPlaceholder("Process this video file and create a note...")
					.setValue(this.plugin.settings.aiPromptVideo)
					.onChange(async (value) => {
						this.plugin.settings.aiPromptVideo = value;
						await this.plugin.saveSettings();
						this.onUpdate();
					});
				text.inputEl.rows = 3;
				text.inputEl.style.width = "100%";
			});

		// Audio prompt
		new Setting(contentEl)
			.setName("Audio Files")
			.setDesc("Prompt for processing audio files")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.aiProcessAudio).onChange(async (value) => {
					this.plugin.settings.aiProcessAudio = value;
					await this.plugin.saveSettings();
					this.onUpdate();
				});
			})
			.addTextArea((text) => {
				text.setPlaceholder("Process this audio file and create a note...")
					.setValue(this.plugin.settings.aiPromptAudio)
					.onChange(async (value) => {
						this.plugin.settings.aiPromptAudio = value;
						await this.plugin.saveSettings();
						this.onUpdate();
					});
				text.inputEl.rows = 3;
				text.inputEl.style.width = "100%";
			});

		// Document prompt
		new Setting(contentEl)
			.setName("Documents")
			.setDesc("Prompt for processing document files")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.aiProcessDocument).onChange(async (value) => {
					this.plugin.settings.aiProcessDocument = value;
					await this.plugin.saveSettings();
					this.onUpdate();
				});
			})
			.addTextArea((text) => {
				text.setPlaceholder("Process this document and create a note...")
					.setValue(this.plugin.settings.aiPromptDocument)
					.onChange(async (value) => {
						this.plugin.settings.aiPromptDocument = value;
						await this.plugin.saveSettings();
						this.onUpdate();
					});
				text.inputEl.rows = 3;
				text.inputEl.style.width = "100%";
			});

		// OK Button
		const buttonContainer = contentEl.createDiv({ cls: "modal-button-container" });
		buttonContainer.style.textAlign = "right";
		buttonContainer.style.marginTop = "20px";

		const okButton = buttonContainer.createEl("button", { text: "OK", cls: "mod-cta" });
		okButton.addEventListener("click", () => {
			this.close();
		});
	}

	onClose() {
		this.contentEl.empty();
	}
}
