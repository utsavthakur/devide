import React, { useState, useEffect, useRef } from 'react';
import {
  FileCode, X, Mic, MicOff, Send, Minimize2, Maximize2, Settings, Check, XCircle, Eye, EyeOff, RefreshCw, ExternalLink, Download
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Button from './Button';
import { generateCode, type FileOperation } from '../services/claudeService';
import { synthesizeSpeech, stopSpeech, VOICES } from '../services/elevenLabsService';
import { speechRecognition } from '../services/speechRecognitionService';
import type { FileSystem, ConversationEntry } from '../types';

interface WebIdeProps {
  project: {
    id: string;
    name: string;
    template: string;
    files: Record<string, string>;
  };
  onExit: () => void;
  onUpdateFiles: (files: Record<string, string>) => void;
}

const API_KEY_STORAGE = 'codexia_api_keys';

export default function WebIde({ project, onExit, onUpdateFiles }: WebIdeProps) {
  const [files, setFiles] = useState<FileSystem>(project.files);
  const [activeFile, setActiveFile] = useState(Object.keys(project.files)[0] || 'App.tsx');
  const [code, setCode] = useState(project.files[Object.keys(project.files)[0]] || '');

  // Voice Assistant State
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeys, setApiKeys] = useState({ claude: '', elevenlabs: '' });
  const [tempApiKeys, setTempApiKeys] = useState({ claude: '', elevenlabs: '' });
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<FileOperation[]>([]);
  const [showApprovalUI, setShowApprovalUI] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const isInternalUpdate = useRef(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load API keys from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE);
    if (stored) {
      try {
        setApiKeys(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load API keys:', e);
      }
    }
  }, []);

  // Sync code changes to files
  useEffect(() => {
    if (!isInternalUpdate.current) {
      setFiles(prev => ({ ...prev, [activeFile]: code }));
    }
    isInternalUpdate.current = false;
  }, [code, activeFile]);

  // Sync files to parent component
  useEffect(() => {
    onUpdateFiles(files);
  }, [files, onUpdateFiles]);

  // Load active file content
  useEffect(() => {
    setCode(files[activeFile] || '');
  }, [activeFile, files]);

  // Auto-scroll conversation
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isVoiceActive) {
        speechRecognition.stop();
        stopSpeech();
      }
    };
  }, [isVoiceActive]);

  const handleVoiceToggle = async () => {
    // Check if API keys are set
    if (!apiKeys.claude || !apiKeys.elevenlabs) {
      setTempApiKeys(apiKeys);
      setShowApiKeyModal(true);
      return;
    }

    if (isVoiceActive) {
      // Stop voice
      speechRecognition.stop();
      stopSpeech();
      setIsVoiceActive(false);
      setCurrentTranscript('');
    } else {
      // Start voice
      try {
        await speechRecognition.start(
          {
            continuous: true,
            interimResults: true,
            language: 'en-US'
          },
          async (transcript, isFinal) => {
            setCurrentTranscript(transcript);
            if (isFinal && transcript.trim()) {
              await handleUserSpeech(transcript);
              setCurrentTranscript('');
            }
          },
          (error) => {
            console.error('Speech recognition error:', error);
          }
        );
        setIsVoiceActive(true);
        setShowVoicePanel(true);
      } catch (error: any) {
        console.error('Failed to start voice:', error);
        alert('Microphone access denied or not available');
      }
    }
  };

  const handleUserSpeech = async (transcript: string) => {
    if (isProcessing) return;

    setIsProcessing(true);

    const userEntry: ConversationEntry = {
      role: 'user',
      content: transcript,
      timestamp: Date.now()
    };
    setConversation(prev => [...prev, userEntry]);

    try {
      const conversationHistory = conversation.map(entry => ({
        role: entry.role,
        content: entry.content
      }));

      const collectedOperations: FileOperation[] = [];

      const { response, operations } = await generateCode(
        transcript,
        conversationHistory,
        (operation) => {
          collectedOperations.push(operation);
        }
      );

      const assistantEntry: ConversationEntry = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
      setConversation(prev => [...prev, assistantEntry]);

      if (response) {
        await synthesizeSpeech(response, { voice: VOICES.RACHEL });
      }

      // If there are file operations, ask for permission
      if (collectedOperations.length > 0) {
        setPendingOperations(collectedOperations);
        setShowApprovalUI(true);
      }
    } catch (error: any) {
      console.error('Processing error:', error);
      const errorMessage = error.message || 'Failed to process request';

      const errorEntry: ConversationEntry = {
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: Date.now()
      };
      setConversation(prev => [...prev, errorEntry]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveChanges = () => {
    pendingOperations.forEach(operation => {
      if (operation.type === 'update_file') {
        const { path, content } = operation;
        isInternalUpdate.current = true;
        setFiles(prev => ({ ...prev, [path]: content || '' }));
        if (activeFile === path) {
          setCode(content || '');
        } else if (!files[path]) {
          setActiveFile(path);
          setCode(content || '');
        }
      } else if (operation.type === 'switch_file') {
        const { path } = operation;
        setActiveFile(path);
      }
    });
    setPendingOperations([]);
    setShowApprovalUI(false);
  };

  const handleRejectChanges = () => {
    setPendingOperations([]);
    setShowApprovalUI(false);

    const rejectEntry: ConversationEntry = {
      role: 'assistant',
      content: 'Changes rejected. Let me know if you need anything else.',
      timestamp: Date.now()
    };
    setConversation(prev => [...prev, rejectEntry]);
  };

  const handleSaveApiKeys = () => {
    if (!tempApiKeys.claude.trim() || !tempApiKeys.elevenlabs.trim()) {
      alert('Please enter both API keys');
      return;
    }
    setApiKeys(tempApiKeys);
    localStorage.setItem(API_KEY_STORAGE, JSON.stringify(tempApiKeys));
    setShowApiKeyModal(false);
    // Auto-start voice after saving keys
    setTimeout(() => handleVoiceToggle(), 100);
  };

  const handleDownload = async () => {
    const zip = new JSZip();

    // Add all files to the zip
    Object.entries(files).forEach(([path, content]) => {
      if (typeof content === 'string') {
        zip.file(path, content);
      }
    });

    try {
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${project.name || 'codexia-project'}.zip`);
    } catch (error) {
      console.error('Failed to generate zip:', error);
      alert('Failed to download project');
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-zinc-300 overflow-hidden font-mono text-sm">
      {/* Top Bar - VS Code Style */}
      <div className="h-9 bg-[#323233] border-b border-[#1e1e1e] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="text-xs text-zinc-400">Codexia</div>
          <div className="text-xs text-zinc-500">|</div>
          <div className="text-xs font-medium">{project.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
            title="API Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
            title="Download Project"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onExit}
            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex w-48 bg-[#252526] border-r border-[#1e1e1e] flex-col">
          <div className="p-2 text-xs text-zinc-500 uppercase tracking-wider">Explorer</div>
          <div className="flex-1 overflow-y-auto">
            {Object.keys(files).map(fileName => (
              <button
                key={fileName}
                onClick={() => setActiveFile(fileName)}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-[#2a2d2e] transition-colors ${activeFile === fileName ? 'bg-[#37373d] text-white' : 'text-zinc-400'
                  }`}
              >
                <FileCode className="w-3 h-3" />
                {fileName}
              </button>
            ))}
          </div>
        </div>

        {/* Editor & Preview Container */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Editor */}
          {/* Editor */}
          <div className={`flex flex-col bg-[#1e1e1e] transition-all ${showPreview ? 'h-1/2 md:h-full md:w-1/2' : 'flex-1'}`}>
            {/* Tab Bar */}
            <div className="h-9 bg-[#252526] border-b border-[#1e1e1e] flex items-center justify-between px-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#1e1e1e] text-xs">
                <FileCode className="w-3 h-3" />
                {activeFile}
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
                title={showPreview ? 'Hide Preview' : 'Show Preview'}
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Code Editor */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-[#1e1e1e] text-zinc-300 p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed"
              style={{ tabSize: 2 }}
              spellCheck={false}
              placeholder="Start coding..."
            />
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="h-1/2 md:h-full md:w-1/2 flex flex-col bg-[#1e1e1e] border-t md:border-t-0 md:border-l border-[#1e1e1e]">
              {/* Preview Header */}
              <div className="h-9 bg-[#252526] border-b border-[#1e1e1e] flex items-center justify-between px-3">
                <div className="text-xs text-zinc-400">Preview</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewKey(prev => prev + 1)}
                    className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
                    title="Refresh Preview"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => window.open('http://localhost:3000', '_blank')}
                    className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
                    title="Open in New Tab"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
                    title="Close Preview"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Preview iframe */}
              <iframe
                key={previewKey}
                ref={iframeRef}
                src="http://localhost:3000"
                className="flex-1 bg-white"
                title="Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
              />
            </div>
          )}
        </div>
      </div>

      {/* Voice Assistant Button - Bottom Right Corner */}
      {!showVoicePanel && (
        <button
          onClick={handleVoiceToggle}
          className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 ${isVoiceActive
            ? 'bg-gradient-to-br from-red-500 to-purple-600 animate-pulse'
            : 'bg-gradient-to-br from-zinc-700 to-zinc-800 hover:from-red-500 hover:to-purple-600'
            }`}
          title="Voice Assistant"
        >
          <Mic className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Voice Assistant Panel */}
      {showVoicePanel && !isPanelMinimized && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-[#252526] border border-zinc-700 rounded-lg shadow-2xl flex flex-col overflow-hidden">
          {/* Panel Header */}
          <div className="h-10 bg-[#323233] border-b border-zinc-700 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isVoiceActive ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`} />
              <span className="text-xs font-medium">Voice Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsPanelMinimized(true)}
                className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setShowVoicePanel(false);
                  if (isVoiceActive) handleVoiceToggle();
                }}
                className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Conversation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {conversation.length === 0 ? (
              <div className="h-full" />
            ) : (
              conversation.map((entry, i) => (
                <div key={i} className={`${entry.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`inline-block max-w-[85%] p-2 rounded text-xs ${entry.role === 'user'
                      ? 'bg-red-900/30 text-red-100'
                      : 'bg-zinc-700/50 text-zinc-300'
                      }`}
                  >
                    {entry.content}
                  </div>
                </div>
              ))
            )}
            {currentTranscript && (
              <div className="text-right">
                <div className="inline-block max-w-[85%] p-2 rounded text-xs bg-red-900/20 text-red-200 italic">
                  "{currentTranscript}"
                </div>
              </div>
            )}
            <div ref={conversationEndRef} />
          </div>

          {/* Approval UI */}
          {showApprovalUI && (
            <div className="border-t border-zinc-700 bg-[#2a2d2e] p-3">
              <div className="text-xs text-zinc-400 mb-2">
                AI wants to modify {pendingOperations.length} file{pendingOperations.length > 1 ? 's' : ''}:
              </div>
              <div className="text-xs text-zinc-300 mb-3 max-h-20 overflow-y-auto">
                {pendingOperations.map((op, i) => (
                  <div key={i}>• {op.path}</div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRejectChanges}
                  className="flex-1 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <XCircle className="w-3 h-3" />
                  Reject
                </button>
                <button
                  onClick={handleApproveChanges}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-xs font-medium text-white transition-colors flex items-center justify-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Approve
                </button>
              </div>
            </div>
          )}

          {/* Voice Controls */}
          <div className="h-14 bg-[#323233] border-t border-zinc-700 flex items-center justify-center gap-4 px-4">
            <button
              onClick={handleVoiceToggle}
              disabled={isProcessing}
              className={`flex-1 h-9 rounded flex items-center justify-center gap-2 font-medium text-xs transition-all ${isVoiceActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                } disabled:opacity-50`}
            >
              {isVoiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isProcessing ? 'Processing...' : isVoiceActive ? 'Stop' : 'Start Voice'}
            </button>
          </div>
        </div>
      )}

      {/* Minimized Voice Panel */}
      {showVoicePanel && isPanelMinimized && (
        <button
          onClick={() => setIsPanelMinimized(false)}
          className="fixed bottom-6 right-6 px-4 py-2 bg-[#323233] border border-zinc-700 rounded-lg shadow-lg hover:bg-[#3e3e42] transition-colors flex items-center gap-2"
        >
          <div className={`w-2 h-2 rounded-full ${isVoiceActive ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="text-xs">Voice Assistant</span>
          <Maximize2 className="w-3 h-3" />
        </button>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#252526] border border-zinc-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-white">API Configuration</h2>
            <p className="text-xs text-zinc-400 mb-6">
              Enter your API keys to enable voice AI features. Keys are stored locally.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Claude API Key</label>
                <input
                  type="password"
                  value={tempApiKeys.claude}
                  onChange={(e) => setTempApiKeys(prev => ({ ...prev, claude: e.target.value }))}
                  placeholder="sk-ant-..."
                  className="w-full px-3 py-2 bg-[#1e1e1e] border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-2">ElevenLabs API Key</label>
                <input
                  type="password"
                  value={tempApiKeys.elevenlabs}
                  onChange={(e) => setTempApiKeys(prev => ({ ...prev, elevenlabs: e.target.value }))}
                  placeholder="..."
                  className="w-full px-3 py-2 bg-[#1e1e1e] border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApiKeyModal(false);
                  setTempApiKeys(apiKeys);
                }}
                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKeys}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-xs font-medium text-white transition-colors"
              >
                Save & Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}