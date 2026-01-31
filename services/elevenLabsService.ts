import { ElevenLabsClient } from 'elevenlabs';

const API_KEY_STORAGE = 'codexia_api_keys';

// Get API key from localStorage or fallback to env
const getApiKey = (): string => {
    try {
        const stored = localStorage.getItem(API_KEY_STORAGE);
        if (stored) {
            const keys = JSON.parse(stored);
            if (keys.elevenlabs) return keys.elevenlabs;
        }
    } catch (e) {
        console.error('Failed to load API key from localStorage:', e);
    }
    return import.meta.env.VITE_ELEVENLABS_API_KEY || '';
};

let client: ElevenLabsClient | null = null;

// Initialize client with API key
const initializeClient = () => {
    const apiKey = getApiKey();
    if (apiKey && apiKey !== 'your_elevenlabs_api_key_here') {
        client = new ElevenLabsClient({ apiKey });
        return true;
    }
    return false;
};

// Try to initialize on load
initializeClient();

// Popular ElevenLabs voices
export const VOICES = {
    RACHEL: 'EXAVITQu4vr4xnSDxMaL', // Professional female
    ADAM: 'pNInz6obpgDQGcFmaJgB',   // Deep male
    BELLA: 'EXAVITQu4vr4xnSDxMaL',  // Soft female
    ANTONI: 'ErXwobaYiN019PkySvjV', // Well-rounded male
    JOSH: 'TxGEqnHWrfWFTfGW9XjX',   // Young male
    SARAH: 'EXAVITQu4vr4xnSDxMaL'   // Confident female
};

export interface SpeechOptions {
    voice?: string;
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
}

/**
 * Audio queue manager for sequential playback
 */
class AudioQueue {
    private queue: AudioBuffer[] = [];
    private isPlaying = false;
    private audioContext: AudioContext;
    private currentSource: AudioBufferSourceNode | null = null;

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    async add(audioData: ArrayBuffer) {
        const audioBuffer = await this.audioContext.decodeAudioData(audioData);
        this.queue.push(audioBuffer);

        if (!this.isPlaying) {
            this.playNext();
        }
    }

    private playNext() {
        if (this.queue.length === 0) {
            this.isPlaying = false;
            return;
        }

        this.isPlaying = true;
        const buffer = this.queue.shift()!;

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);

        source.onended = () => {
            this.currentSource = null;
            this.playNext();
        };

        this.currentSource = source;
        source.start(0);
    }

    stop() {
        if (this.currentSource) {
            this.currentSource.stop();
            this.currentSource = null;
        }
        this.queue = [];
        this.isPlaying = false;
    }

    clear() {
        this.queue = [];
    }
}

// Global audio queue instance
const audioQueue = new AudioQueue();

/**
 * Convert text to speech using ElevenLabs
 */
export const synthesizeSpeech = async (
    text: string,
    options: SpeechOptions = {}
): Promise<void> => {
    // Try to reinitialize client in case keys were just added
    if (!client) {
        initializeClient();
    }

    if (!client) {
        console.warn('ElevenLabs API Key not configured');
        // Fallback to browser's speech synthesis
        speakWithBrowserAPI(text);
        return;
    }

    try {
        const {
            voice = VOICES.RACHEL,
            stability = 0.5,
            similarityBoost = 0.75,
            style = 0.0,
            useSpeakerBoost = true
        } = options;

        const audio = await client.textToSpeech.convert(voice, {
            text,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
                stability,
                similarity_boost: similarityBoost,
                style,
                use_speaker_boost: useSpeakerBoost
            }
        });

        // Convert stream to ArrayBuffer
        const chunks: BlobPart[] = [];
        for await (const chunk of audio) {
            chunks.push(chunk);
        }

        const blob = new Blob(chunks, { type: 'audio/mpeg' });
        const arrayBuffer = await blob.arrayBuffer();

        // Add to queue for sequential playback
        await audioQueue.add(arrayBuffer);

    } catch (error) {
        console.error('ElevenLabs API Error:', error);
        // Fallback to browser speech
        speakWithBrowserAPI(text);
    }
};

/**
 * Stream text to speech for real-time playback
 */
export const streamSpeech = async (
    text: string,
    options: SpeechOptions = {}
): Promise<void> => {
    if (!client) {
        initializeClient();
    }

    if (!client) {
        speakWithBrowserAPI(text);
        return;
    }

    try {
        const {
            voice = VOICES.RACHEL,
            stability = 0.5,
            similarityBoost = 0.75
        } = options;

        const audio = await client.textToSpeech.convertAsStream(voice, {
            text,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
                stability,
                similarity_boost: similarityBoost
            }
        });

        const chunks: BlobPart[] = [];
        for await (const chunk of audio) {
            chunks.push(chunk);
        }

        const blob = new Blob(chunks, { type: 'audio/mpeg' });
        const arrayBuffer = await blob.arrayBuffer();

        await audioQueue.add(arrayBuffer);

    } catch (error) {
        console.error('ElevenLabs Stream Error:', error);
        speakWithBrowserAPI(text);
    }
};

/**
 * Fallback: Use browser's built-in speech synthesis
 */
const speakWithBrowserAPI = (text: string) => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to find a good voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
            v.name.includes('Google') ||
            v.name.includes('Microsoft') ||
            v.lang.startsWith('en')
        );

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        speechSynthesis.speak(utterance);
    } else {
        console.warn('Speech synthesis not supported in this browser');
    }
};

/**
 * Stop all audio playback
 */
export const stopSpeech = () => {
    audioQueue.stop();

    // Also stop browser speech synthesis
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    }
};

/**
 * Clear the audio queue without stopping current playback
 */
export const clearQueue = () => {
    audioQueue.clear();
};

/**
 * Check if ElevenLabs is configured
 */
export const isConfigured = (): boolean => {
    return client !== null;
};
