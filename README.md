# Codexia - Voice-First AI IDE

Build software by speaking to your AI architect, powered by **Claude** and **ElevenLabs**.

## Features

- 🎤 **Voice-Driven Development** - Speak naturally to create and modify code
- 🤖 **Claude AI** - Advanced code generation with Claude Sonnet 4
- 🔊 **ElevenLabs TTS** - High-quality voice synthesis for AI responses
- 📝 **Real-time Transcription** - See what you're saying as you speak
- 💬 **Conversation History** - Track your development session
- 🎨 **Modern UI** - Sleek, futuristic interface

## Run Locally

**Prerequisites:**  Node.js 18+

### 1. Install dependencies:
```bash
npm install
```

### 2. Configure API Keys:

Create or update `.env.local` with your API keys:

```env
VITE_CLAUDE_API_KEY=your_claude_api_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

**Get your API keys:**
- **Claude API**: [console.anthropic.com](https://console.anthropic.com/)
- **ElevenLabs API**: [elevenlabs.io](https://elevenlabs.io/)

### 3. Run the app:
```bash
npm run dev
```

### 4. Allow microphone access when prompted

## Usage

1. Click "Initialize Core" to start the voice session
2. Allow microphone access in your browser
3. Speak naturally to create or modify code
4. Watch as Codexia writes code and responds with voice

**Example commands:**
- "Create a React component for a login form"
- "Add a button that changes color on hover"
- "Switch to the styles file"
- "Create a new file called utils.ts with a helper function"

## Tech Stack

- **React** + **TypeScript** + **Vite**
- **Claude API** (Anthropic) - Code generation
- **ElevenLabs** - Text-to-speech
- **Web Speech API** - Speech recognition
- **Lucide React** - Icons
Get API keys:

Claude: https://console.anthropic.com/
ElevenLabs: https://elevenlabs.io/


Set Up Your API Keys (Required)
You need to configure your API keys before Codexia can work. Create a .env.local file with:

env
VITE_CLAUDE_API_KEY=your_claude_api_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
Get your keys from:

Claude: https://console.anthropic.com/
ElevenLabs: https://elevenlabs.io/
2. Open the App in Your Browser
Since npm run dev is running, you should see a local URL in your terminal (usually http://localhost:5173). Open that URL in your browser.

3. Start Using Codexia
Once the app loads:

Click "Initialize Core" to start the voice session
Allow microphone access when your browser prompts you
Start speaking your coding commands!
