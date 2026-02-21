import { compareVersions } from "compare-versions";
import { createRequire } from "module"; // Нужно для импорта JSON в .mjs

// Создаем require для чтения package.json
const require = createRequire(import.meta.url);
const pkg = require("./package.json");

// 1. АВТОМАТИЧЕСКАЯ версия из package.json
export const releaseVersion = pkg.version;

export const showNewFeatures = true;
export let showBreakingChanges = false;

// 2. ТВОИ данные (тексты новых фич меняешь тут при каждом релизе)
const newFeatures = `• <b>Multi-provider AI</b> — choose OpenAI, Anthropic Claude, or Google Gemini in settings.
• <b>Custom prompts</b> — per content type (text, voice, photo, video, audio, document) plus a general formatting prompt; toggles to enable/disable processing per type.
• <b>Custom AI parameters</b> — define your own parameters (name → prompt) for note organization.
• <b>Local document extraction</b> — PDF and DOCX text extraction (pdf-parse, mammoth) in addition to existing formats.
• <b>AI robustness</b> — retries on temporary errors (429, 5xx), improved vision and message-type handling.`;

// Если есть критические изменения, пиши их сюда
export const breakingChanges = `⚠️ <b><i>Breaking changes!</i></b> ⚠️`;

// 3. ТВОИ ссылки (reaLm74)
export const telegramChannelLink = "https://t.me/realm74"; // Твой контакт
export const repositoryLink = "https://github.com/reaLm74/obsidian-telegram-ai-sync";
export const privacyPolicyLink = `${repositoryLink}/blob/main/SECURITY.md`; // Ссылка на политику/безопасность

// Генерация HTML ссылок
const telegramContactAHref = `<a href='${telegramChannelLink}'>@realm74</a>`;
const telegramContactIntroduction = `For support and questions, contact ${telegramContactAHref} on Telegram.`;

const githubLink = `<a href='${repositoryLink}'>GitHub repository</a>`;
const githubIntroduction = `Visit the ${githubLink} for documentation, issues, and updates.`;

const supportMessage = `If you find this plugin helpful, please consider starring the repository and sharing your feedback!`;

const bestRegards = "Best regards,\nEvgeniy Berezovskiy\n🚀";

// 4. Шаблон заметки о релизе
export const notes = `
<u><b>Telegram AI Sync ${releaseVersion}</b></u>

🆕 ${newFeatures}

📞 ${telegramContactIntroduction}

📚 ${githubIntroduction}

⭐ ${supportMessage}

${bestRegards}`;

// Вспомогательные функции (оставлены как было, нужны для логики)
export function showBreakingChangesInReleaseNotes() {
	showBreakingChanges = true;
}

export function versionALessThanVersionB(versionA, versionB) {
	if (!versionA || !versionB) return undefined;
	return compareVersions(versionA, versionB) == -1;
}

// ПРОВЕРКА УДАЛЕНА
// Блок "if (check)..." удален, так как версия берется автоматически
// и ошибки "outdated version" теперь быть не может.
