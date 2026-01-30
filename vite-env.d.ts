/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CLAUDE_API_KEY: string
    readonly VITE_ELEVENLABS_API_KEY: string
    readonly GEMINI_API_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
