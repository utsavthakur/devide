/**
 * Speech Recognition Service
 * Wrapper around browser's Web Speech API for voice input
 */

export interface TranscriptEntry {
    text: string;
    timestamp: number;
    isFinal: boolean;
}

export interface SpeechRecognitionConfig {
    continuous?: boolean;
    interimResults?: boolean;
    language?: string;
    maxAlternatives?: number;
}

type SpeechRecognitionCallback = (transcript: string, isFinal: boolean) => void;
type ErrorCallback = (error: string) => void;
type VolumeCallback = (volume: number) => void;

class SpeechRecognitionService {
    private recognition: any = null;
    private isListening = false;
    private onTranscriptCallback: SpeechRecognitionCallback | null = null;
    private onErrorCallback: ErrorCallback | null = null;
    private onVolumeCallback: VolumeCallback | null = null;

    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private microphone: MediaStreamAudioSourceNode | null = null;
    private volumeInterval: number | null = null;

    constructor() {
        // Check if browser supports speech recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error('Speech Recognition not supported in this browser');
            return;
        }

        this.recognition = new SpeechRecognition();
    }

    /**
     * Initialize and start speech recognition
     */
    async start(
        config: SpeechRecognitionConfig = {},
        onTranscript: SpeechRecognitionCallback,
        onError?: ErrorCallback,
        onVolume?: VolumeCallback
    ): Promise<void> {
        if (!this.recognition) {
            throw new Error('Speech Recognition not supported');
        }

        if (this.isListening) {
            console.warn('Already listening');
            return;
        }

        this.onTranscriptCallback = onTranscript;
        this.onErrorCallback = onError || null;
        this.onVolumeCallback = onVolume || null;

        // Configure recognition
        this.recognition.continuous = config.continuous ?? true;
        this.recognition.interimResults = config.interimResults ?? true;
        this.recognition.language = config.language ?? 'en-US';
        this.recognition.maxAlternatives = config.maxAlternatives ?? 1;

        // Set up event handlers
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('Speech recognition started');
        };

        this.recognition.onresult = (event: any) => {
            const result = event.results[event.results.length - 1];
            const transcript = result[0].transcript;
            const isFinal = result.isFinal;

            if (this.onTranscriptCallback) {
                this.onTranscriptCallback(transcript, isFinal);
            }
        };

        this.recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);

            if (this.onErrorCallback) {
                this.onErrorCallback(event.error);
            }

            // Auto-restart on certain errors
            if (event.error === 'no-speech' || event.error === 'audio-capture') {
                setTimeout(() => {
                    if (this.isListening) {
                        this.recognition.start();
                    }
                }, 1000);
            }
        };

        this.recognition.onend = () => {
            // Auto-restart if we're supposed to be listening
            if (this.isListening) {
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        console.error('Failed to restart recognition:', e);
                    }
                }, 100);
            }
        };

        // Start recognition
        try {
            this.recognition.start();

            // Set up volume monitoring if callback provided
            if (this.onVolumeCallback) {
                await this.startVolumeMonitoring();
            }
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            throw error;
        }
    }

    /**
     * Stop speech recognition
     */
    stop(): void {
        if (!this.recognition || !this.isListening) {
            return;
        }

        this.isListening = false;
        this.recognition.stop();
        this.stopVolumeMonitoring();

        console.log('Speech recognition stopped');
    }

    /**
     * Check if currently listening
     */
    getIsListening(): boolean {
        return this.isListening;
    }

    /**
     * Start monitoring microphone volume
     */
    private async startVolumeMonitoring(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;

            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);

            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            // Monitor volume levels
            this.volumeInterval = window.setInterval(() => {
                if (!this.analyser || !this.onVolumeCallback) return;

                this.analyser.getByteFrequencyData(dataArray);

                // Calculate average volume
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                const volume = Math.min(100, (average / 128) * 100);

                this.onVolumeCallback(volume);
            }, 50);

        } catch (error) {
            console.error('Failed to start volume monitoring:', error);
        }
    }

    /**
     * Stop volume monitoring
     */
    private stopVolumeMonitoring(): void {
        if (this.volumeInterval) {
            clearInterval(this.volumeInterval);
            this.volumeInterval = null;
        }

        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.analyser = null;
    }

    /**
     * Check if speech recognition is supported
     */
    static isSupported(): boolean {
        return !!(
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition
        );
    }
}

// Export singleton instance
export const speechRecognition = new SpeechRecognitionService();

// Export class for custom instances if needed
export default SpeechRecognitionService;
