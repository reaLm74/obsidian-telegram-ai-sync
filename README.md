# Telegram AI Sync

[![GitHub release](https://img.shields.io/github/release/reaLm74/obsidian-telegram-ai-sync.svg)](https://github.com/reaLm74/obsidian-telegram-ai-sync/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An advanced Obsidian plugin that intelligently syncs Telegram messages to your vault with AI-powered processing, smart categorization, and automated content organization.

## ✨ Key Features

### 🤖 AI-Powered Processing
- **Multi-Provider Support**: OpenAI (GPT-4), Anthropic Claude, Google Gemini
- **Smart Content Analysis**: Automatically processes text, images, videos, audio, and documents
- **Hierarchical Prompts**: General formatting + content-specific prompts for optimal results
- **Custom AI Parameters**: Create dynamic variables like `{{ai:title}}` for intelligent file naming

### 📱 Advanced Telegram Integration
- **Media Group Support**: Handles multiple images/files sent as albums
- **Content Type Detection**: Automatically identifies and processes different message types
- **Forward Chain Support**: Maintains message threading and context
- **Bot & User Client**: Dual connection modes for maximum flexibility

### 🗂️ Smart Organization
- **AI Categorization**: Automatically sorts messages into predefined categories
- **Dynamic Templates**: Use variables like `{{date:YYYY-MM}}`, `{{content:20}}`, `{{ai:custom}}`
- **Folder Structure**: Automatic directory creation and organization
- **Duplicate Prevention**: Smart handling of repeated content

### 📄 Local Document Processing
- **Text Extraction**: Local processing for TXT, JSON, CSV, XML, HTML, Markdown, YAML
- **Code File Support**: JavaScript, TypeScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust, Swift, SQL
- **Cost Optimization**: Reduces AI API calls by processing supported formats locally
- **Fallback Support**: Seamlessly falls back to AI processing for unsupported formats

### ⚡ Performance & Efficiency
- **Optimized AI Calls**: Intelligent prompt combining to minimize API requests
- **Batch Processing**: Handles multiple messages efficiently
- **Queue Management**: Sequential processing prevents conflicts
- **Error Recovery**: Robust retry mechanisms and error handling

## 🚀 Quick Start

### Prerequisites
- Obsidian v1.0.0 or higher
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- AI Provider API Key (OpenAI, Claude, or Gemini)

### Installation

1. **Download the Plugin**
   - Download the latest release from [GitHub Releases](https://github.com/reaLm74/obsidian-telegram-ai-sync/releases)
   - Extract to your `.obsidian/plugins/` folder

2. **Enable the Plugin**
   - Go to Settings → Community Plugins
   - Enable "Telegram AI Sync"

3. **Configure Telegram Bot**
   - Create a bot via [@BotFather](https://t.me/botfather)
   - Copy the bot token to plugin settings
   - Add your Telegram user ID to allowed chats

4. **Set Up AI Provider**
   - Choose your preferred AI provider (OpenAI/Claude/Gemini)
   - Add your API key in AI Settings
   - Configure prompts for different content types

## 📋 Configuration Guide

### Basic Setup

1. **Telegram Settings**
   ```
   Bot Token: YOUR_BOT_TOKEN
   Allowed Chats: YOUR_TELEGRAM_USER_ID
   ```

2. **AI Configuration**
   ```
   Provider: OpenAI / Claude / Gemini
   API Key: YOUR_API_KEY
   Model: gpt-4o-mini / claude-3-haiku / gemini-1.5-flash
   ```

3. **Categories Setup**
   ```
   Work: Work/{{date:YYYY}}/{{date:MM}}/{{date:DD-HH-mm}}.md
   Personal: Personal/{{date:YYYY-MM}}/{{date:DD-HH-mm}}.md
   Ideas: Ideas/{{date:YYYY}}/{{content:30}}.md
   ```

### Advanced Features

#### Custom AI Parameters
Create dynamic variables for intelligent file naming:

```
Parameter: title
Prompt: "Generate a concise title for this note (max 50 characters, no punctuation at the end)"
Usage: Notes/{{ai:title}}.md
```

#### Content-Specific Prompts
- **Text Prompt**: For processing text messages
- **Photo Prompt**: For analyzing images
- **Document Prompt**: For processing files
- **General Prompt**: For final formatting

#### Template Variables
- `{{date:YYYY-MM-DD}}` - Current date
- `{{content:20}}` - First 20 characters of content
- `{{ai:title}}` - AI-generated title
- `{{category}}` - Message category
- `{{ai:custom_param}}` - Your custom AI parameters

## 🔧 Usage Examples

### Sending Messages

1. **Text Message**
   ```
   Send: "Meeting notes from today's standup"
   Result: Creates note with AI-processed content and smart categorization
   ```

2. **Image with Caption**
   ```
   Send: Photo + "Screenshot of the new design"
   Result: AI analyzes image, processes caption, creates organized note
   ```

3. **Document Upload**
   ```
   Send: report.pdf + "Q3 financial report"
   Result: Extracts text locally (if supported) or via AI, processes with context
   ```

4. **Media Album**
   ```
   Send: Multiple photos + "Vacation photos from Paris"
   Result: Groups all images in single note with combined AI analysis
   ```

### AI Processing Flow

```
1. Message Received → Content Type Detection
2. Local Processing (if supported) → Text Extraction
3. AI Analysis → Content-Specific Prompt
4. Categorization → Smart Folder Assignment
5. Note Creation → Template Application
6. File Organization → Final Result
```

## 🎛️ Settings Overview

### Telegram Connection
- **Bot Token**: Your Telegram bot token
- **Allowed Chats**: Whitelist of authorized users
- **Connection Status**: Real-time connection monitoring

### AI Configuration
- **Provider Selection**: OpenAI, Claude, or Gemini
- **Model Settings**: Temperature, max tokens, timeout
- **Prompt Management**: Content-specific and general prompts
- **Processing Toggles**: Enable/disable AI for each content type

### Organization
- **Categories**: Define note categories with keywords
- **Templates**: Customize file paths and naming
- **Distribution Rules**: Advanced message routing
- **Local Processing**: Enable document text extraction

### Performance
- **Queue Settings**: Parallel vs sequential processing
- **Retry Configuration**: Error handling and recovery
- **Cache Management**: Optimize performance

## 🔒 Privacy & Security

- **Local Processing**: Supported document types are processed locally
- **API Security**: Secure storage of API keys with encryption
- **Data Control**: All data remains in your Obsidian vault
- **No Tracking**: No analytics or data collection

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/reaLm74/obsidian-telegram-ai-sync.git
cd obsidian-telegram-ai-sync

# Install dependencies
npm install

# Build the plugin
npm run build

# Development mode
npm run dev
```

### Project Structure
```
src/
├── ai/                 # AI provider integrations
├── categories/         # Smart categorization system
├── settings/          # Configuration management
├── telegram/          # Telegram bot & client
├── utils/             # Utilities and helpers
└── main.ts           # Plugin entry point
```

## 📝 Changelog

### v0.1.0 (Latest)
- **New**: AI-powered content processing with multi-provider support
- **New**: Smart media group handling for albums
- **New**: Local document text extraction
- **New**: Custom AI parameters system
- **New**: Hierarchical prompt architecture
- **Improved**: Optimized AI API calls (reduced by 50% in many cases)
- **Improved**: Enhanced error handling and retry mechanisms
- **Fixed**: Media group processing issues
- **Changed**: Complete UI/UX overhaul

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Obsidian Plugin API](https://docs.obsidian.md/)
- Telegram integration via [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- AI providers: OpenAI, Anthropic, Google

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/reaLm74/obsidian-telegram-ai-sync/issues)
- **Discussions**: [GitHub Discussions](https://github.com/reaLm74/obsidian-telegram-ai-sync/discussions)
- **Author**: [Evgeniy Berezovskiy](https://github.com/reaLm74)

---

**Made with ❤️ for the Obsidian community**