import React, { useState, useEffect, useRef } from 'react';
import {
  FileCode, X, Power,
  Mic, MicOff, Volume2, Activity, Cpu, MessageSquare
} from 'lucide-react';
import Button from './Button';
import { generateCode, type FileOperation } from '../services/claudeService';
import { synthesizeSpeech, stopSpeech, VOICES } from '../services/elevenLabsService';
import { speechRecognition } from '../services/speechRecognitionService';
import type { FileSystem, ConversationEntry } from '../types';

// Initial file system
const INITIAL_FILES: FileSystem = {
  'App.tsx': `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white p-10 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-600 mb-6">
          Codexia Voice
        </h1>
        <p className="text-zinc-400 text-xl">
          "Speak to build your vision."
        </p>
      </div>
    </div>
  );
}`,
  'index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background: #000;
  color: white;
}`,
  'README.md': `# Codexia Voice Project\n\nBuild software by speaking to your AI architect.`
};

export default function WebIde({ onExit }: { onExit: () => void }) {
  const [files, setFiles] = useState<FileSystem>(INITIAL_FILES);
  const [activeFile, setActiveFile] = useState('App.tsx');
  const [code, setCode] = useState(INITIAL_FILES['App.tsx']);

  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [volume, setVolume] = useState(0);

  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [logs, setLogs] = useState<string[]>([
    '> System initialized.',
    '> Ready to connect to Codexia Core...'
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const isInternalUpdate = useRef(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Sync code changes to files
  useEffect(() => {
    if (!isInternalUpdate.current) {
      setFiles(prev => ({ ...prev, [activeFile]: code }));
    }
    isInternalUpdate.current = false;
  }, [code, activeFile]);

  // Load active file content
  useEffect(() => {
    setCode(files[activeFile] || '');
  }, [activeFile, files]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  // Auto-scroll conversation
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const disconnect = () => {
    speechRecognition.stop();
    stopSpeech();
    setIsConnected(false);
    setIsListening(false);
    setCurrentTranscript('');
    setLogs(prev => [...prev, '> Disconnected from Core.']);
  };

  const toggleConnection = async () => {
    if (isConnected) {
      disconnect();
      return;
    }

    setLogs(prev => [...prev, '> Initializing Neural Link...', '> Requesting Microphone Access...']);

    try {
      // Start speech recognition
      await speechRecognition.start(
        {
          continuous: true,
          interimResults: true,
          language: 'en-US'
        },
        async (transcript, isFinal) => {
          setCurrentTranscript(transcript);

          if (isFinal && transcript.trim()) {
            // User finished speaking
            await handleUserSpeech(transcript);
            setCurrentTranscript('');
          }
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setLogs(prev => [...prev, `> Error: ${error}`]);
        },
        (vol) => {
          setVolume(vol);
        }
      );

      setIsConnected(true);
      setIsListening(true);
      setLogs(prev => [...prev, '> Neural Link Established.', '> Core Online. Listening...']);

    } catch (error: any) {
      console.error('Connection error:', error);
      setLogs(prev => [...prev, `> Error: ${error.message || 'Failed to connect'}`]);
      setIsConnected(false);
    }
  };

  const handleUserSpeech = async (transcript: string) => {
    if (isProcessing) return;

    setIsProcessing(true);

    // Add user message to conversation
    const userEntry: ConversationEntry = {
      role: 'user',
      content: transcript,
      timestamp: Date.now()
    };
    setConversation(prev => [...prev, userEntry]);
    setLogs(prev => [...prev, `> User: ${transcript}`]);

    try {
      // Generate response with Claude
      const conversationHistory = conversation.map(entry => ({
        role: entry.role,
        content: entry.content
      }));

      const { response, operations } = await generateCode(
        transcript,
        conversationHistory,
        (operation) => {
          handleFileOperation(operation);
        }
      );

      // Add assistant response to conversation
      const assistantEntry: ConversationEntry = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
      setConversation(prev => [...prev, assistantEntry]);
      setLogs(prev => [...prev, `> Codexia: ${response}`]);

      // Speak the response
      if (response) {
        await synthesizeSpeech(response, { voice: VOICES.RACHEL });
      }

    } catch (error: any) {
      console.error('Processing error:', error);
      const errorMessage = error.message || 'Failed to process request';
      setLogs(prev => [...prev, `> Error: ${errorMessage}`]);

      await synthesizeSpeech(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileOperation = (operation: FileOperation) => {
    if (operation.type === 'update_file') {
      const { path, content } = operation;

      isInternalUpdate.current = true;
      setFiles(prev => ({ ...prev, [path]: content || '' }));

      if (activeFile === path) {
        setCode(content || '');
      } else if (!files[path]) {
        // New file - switch to it
        setActiveFile(path);
        setCode(content || '');
      }

      setLogs(prev => [...prev, `> Updated ${path}`]);
    } else if (operation.type === 'switch_file') {
      const { path } = operation;
      setActiveFile(path);
      setLogs(prev => [...prev, `> Switched to ${path}`]);
    }
  };

  const toggleMic = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setLogs(prev => [...prev, '> Microphone enabled']);
    } else {
      setLogs(prev => [...prev, '> Microphone muted']);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-zinc-300 overflow-hidden font-sans fixed inset-0 z-50">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,23,0.5)_2px,transparent_2px),linear-gradient(90deg,rgba(18,18,23,0.5)_2px,transparent_2px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top glow */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent transition-opacity duration-1000 ${isConnected ? 'opacity-100' : 'opacity-0'}`} />

      {/* Header */}
      <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-black/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isConnected ? 'bg-red-950/20 border-red-500/50 text-red-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
            <Activity className={`w-4 h-4 ${isConnected ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-bold tracking-widest uppercase">
              {isConnected ? 'LIVE LINK ACTIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {isConnected && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="w-1 bg-red-500 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(4, volume * Math.random() * 2)}px` }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleConnection}
            className={`!border-opacity-50 ${isConnected ? 'border-red-500 text-red-400 hover:bg-red-950/30' : 'hover:border-red-500 hover:text-red-400'}`}
          >
            <Power className="w-4 h-4 mr-2" />
            {isConnected ? 'Disconnect' : 'Initialize Core'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { disconnect(); onExit(); }}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden z-10">
        {/* Sidebar */}
        <div className="w-64 border-r border-zinc-900 bg-black/50 flex flex-col backdrop-blur-sm">
          <div className="p-4 text-xs font-bold text-zinc-600 tracking-wider uppercase mb-2">Project Files</div>
          <div className="flex-1 overflow-y-auto px-2">
            {Object.keys(files).map(fileName => (
              <div
                key={fileName}
                onClick={() => setActiveFile(fileName)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg text-sm cursor-pointer mb-1 transition-all ${activeFile === fileName ? 'bg-red-900/10 text-red-100 border border-red-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
              >
                <FileCode className={`w-4 h-4 ${activeFile === fileName ? 'text-red-500' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                {fileName}
              </div>
            ))}
          </div>

          {/* System Log */}
          <div className="h-1/3 border-t border-zinc-900 p-4 font-mono text-xs overflow-hidden flex flex-col">
            <div className="text-zinc-600 font-bold mb-2 uppercase flex items-center gap-2">
              <Cpu className="w-3 h-3" /> System Log
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar opacity-70">
              {logs.map((log, i) => (
                <div key={i} className="text-zinc-500 truncate">{log}</div>
              ))}
              <div ref={conversationEndRef} />
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col bg-zinc-950/30 relative">
          {!isConnected && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 max-w-md text-center shadow-2xl shadow-purple-900/20">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-purple-600 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Voice Environment Ready</h2>
                <p className="text-zinc-400 mb-6">
                  Connect to the neural core to begin voice-driven development with Claude AI.
                  Allow microphone access when prompted.
                </p>
                <Button variant="primary" size="lg" onClick={toggleConnection} className="w-full">
                  Initialize Voice Link
                </Button>
              </div>
            </div>
          )}

          <div className="h-10 bg-zinc-900/50 border-b border-zinc-900 flex items-center px-4 gap-2">
            <span className="text-zinc-500 text-xs uppercase tracking-wide">Active Buffer:</span>
            <span className="text-zinc-200 text-sm font-mono">{activeFile}</span>
          </div>

          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setFiles(prev => ({ ...prev, [activeFile]: e.target.value }));
            }}
            className="flex-1 bg-transparent text-zinc-300 p-8 font-mono text-sm resize-none focus:outline-none leading-relaxed"
            spellCheck={false}
          />

          {/* Voice Control Bar */}
          <div className="h-20 border-t border-zinc-900 bg-black flex items-center px-8 gap-6 justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <div className={`w-96 h-32 bg-red-600 blur-[100px] transition-opacity duration-300 ${isConnected ? 'opacity-50' : 'opacity-0'}`} />
            </div>

            <div className="relative z-10 flex items-center gap-6">
              <button
                onClick={toggleMic}
                className={`p-4 rounded-full border transition-all duration-300 ${isListening && isConnected ? 'bg-red-600 border-red-500 shadow-lg shadow-red-500/50 text-white hover:scale-105' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}
                disabled={!isConnected}
              >
                {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>

              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  {isProcessing ? 'Processing...' : isConnected ? (isListening ? 'Listening...' : 'Mic Muted') : 'Offline'}
                </span>
                {currentTranscript && (
                  <span className="text-xs text-zinc-400 italic max-w-md truncate">
                    "{currentTranscript}"
                  </span>
                )}
                <div className="flex items-end gap-1 h-8 mt-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-75 ${isConnected ? 'bg-red-500' : 'bg-zinc-800'}`}
                      style={{
                        height: isConnected && isListening ? `${Math.max(20, Math.random() * volume * 2)}%` : '20%',
                        opacity: isConnected ? 1 : 0.3
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-500">
                <Volume2 className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Panel */}
        {isConnected && conversation.length > 0 && (
          <div className="w-80 border-l border-zinc-900 bg-black/50 backdrop-blur-sm flex flex-col">
            <div className="p-4 border-b border-zinc-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Conversation</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversation.map((entry, i) => (
                <div key={i} className={`${entry.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-[90%] p-3 rounded-lg text-sm ${entry.role === 'user' ? 'bg-red-900/20 text-red-100 border border-red-500/20' : 'bg-zinc-900 text-zinc-300'}`}>
                    <div className="text-xs opacity-60 mb-1">
                      {entry.role === 'user' ? 'You' : 'Codexia'}
                    </div>
                    {entry.content}
                  </div>
                </div>
              ))}
              <div ref={conversationEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}