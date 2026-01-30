import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Save, Share2, Sparkles, FileCode, Search, Settings, Copy, Check } from 'lucide-react';
import { generateCodeSnippet } from '../services/geminiService';
import Button from './Button';

const IdeDemo: React.FC = () => {
  const [code, setCode] = useState(`// Welcome to Codexia IDE
// Type a prompt below to ask our AI to write code for you.

import React from 'react';

export default function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Hello from Codexia</h1>
      <p>Start building instantly.</p>
    </div>
  );
}`);
  
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('App.tsx');
  const [hasCopied, setHasCopied] = useState(false);
  
  // Ref for the code container to scroll to bottom if needed
  const codeRef = useRef<HTMLPreElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    // Simulate thinking time for effect + API call
    const start = Date.now();
    const result = await generateCodeSnippet(prompt);
    const end = Date.now();
    
    // Ensure at least 800ms animation
    const delay = Math.max(0, 800 - (end - start));
    
    setTimeout(() => {
      setCode(result);
      setIsGenerating(false);
    }, delay);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <section id="demo" className="py-24 relative overflow-hidden">
      {/* Background Glow: Updated to Red/Purple */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/30 border border-red-500/30 text-red-300 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Coding</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Code at the speed of thought</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Experience the future of development. Ask Codexia AI to generate components, fix bugs, or explain logic directly in the editor.
          </p>
        </div>

        {/* IDE Window */}
        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-[#09090b] shadow-2xl max-w-5xl mx-auto ring-1 ring-white/5">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#18181b] border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="flex gap-2 mr-4">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="flex gap-1 bg-[#09090b] px-3 py-1.5 rounded-md border border-zinc-800">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs text-zinc-500 font-mono">codexia-demo / src / </span>
                <span className="text-xs text-zinc-300 font-mono">{activeTab}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={copyCode} className="text-zinc-400 hover:text-white transition-colors" title="Copy Code">
                {hasCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <div className="h-4 w-[1px] bg-zinc-700" />
              <button className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-medium px-2 py-1 bg-red-900/20 rounded border border-red-900/30 transition-colors">
                <Play className="w-3 h-3 fill-current" />
                Run
              </button>
            </div>
          </div>

          <div className="flex h-[500px] md:h-[600px]">
            {/* Sidebar */}
            <div className="hidden md:flex w-14 flex-col items-center py-4 border-r border-zinc-800 bg-[#09090b] text-zinc-500 gap-6">
              <FileCode className="w-6 h-6 text-zinc-200 cursor-pointer" />
              <Search className="w-6 h-6 hover:text-zinc-200 transition-colors cursor-pointer" />
              <Share2 className="w-6 h-6 hover:text-zinc-200 transition-colors cursor-pointer" />
              <Terminal className="w-6 h-6 hover:text-zinc-200 transition-colors cursor-pointer" />
              <div className="flex-1" />
              <Settings className="w-6 h-6 hover:text-zinc-200 transition-colors cursor-pointer" />
            </div>

            {/* File Explorer (Mini) */}
            <div className="hidden lg:block w-48 bg-[#09090b] border-r border-zinc-800 py-3">
              <div className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Explorer</div>
              <div className="flex flex-col">
                 {['App.tsx', 'index.css', 'utils.ts', 'types.ts', 'package.json'].map(file => (
                   <button 
                    key={file}
                    onClick={() => setActiveTab(file)}
                    className={`text-left px-4 py-1.5 text-sm font-mono flex items-center gap-2 hover:bg-zinc-800 ${activeTab === file ? 'bg-zinc-800 text-red-400 border-l-2 border-red-500' : 'text-zinc-400 border-l-2 border-transparent'}`}
                   >
                     <span className="opacity-70">{file.endsWith('tsx') || file.endsWith('ts') ? 'TS' : '#'}</span>
                     {file}
                   </button>
                 ))}
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col bg-[#09090b] relative">
              {/* Code Area */}
              <div className="flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed relative custom-scrollbar">
                 <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#09090b] border-r border-zinc-800/50 flex flex-col items-end pr-3 pt-6 text-zinc-600 select-none">
                   {Array.from({length: 25}).map((_, i) => (
                     <div key={i} className="h-6">{i + 1}</div>
                   ))}
                 </div>
                 <pre ref={codeRef} className="pl-12 text-zinc-300">
                   <code>
                     {code.split('\n').map((line, i) => (
                       <div key={i} className="h-6 whitespace-pre">
                         {/* Simple syntax highlighting simulation */}
                         {/* Keywords: Purple -> Red-400 */}
                         {line.replace(/\/\/.*/g, '<span class="text-zinc-500">$&</span>')
                              .replace(/(import|export|default|function|const|return|var|let)/g, '<span class="text-red-400">$&</span>')
                              .replace(/('.*?')/g, '<span class="text-purple-300">$&</span>')
                              .replace(/(".*?")/g, '<span class="text-purple-300">$&</span>')
                              .split(/(<span.*?>.*?<\/span>)/g)
                              .map((part, index) => {
                                 if (part.startsWith('<span')) {
                                   const match = part.match(/class="(.*?)">(.*?)<\/span>/);
                                   if (match) return <span key={index} className={match[1]}>{match[2]}</span>;
                                 }
                                 return <span key={index}>{part}</span>;
                              })
                         }
                       </div>
                     ))}
                   </code>
                 </pre>
                 
                 {isGenerating && (
                   <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-20">
                     <div className="flex items-center gap-3 bg-zinc-900 border border-red-500/30 px-4 py-3 rounded-lg shadow-2xl animate-pulse">
                       <Sparkles className="w-5 h-5 text-red-400 animate-spin" />
                       <span className="text-red-200 font-medium">Codexia AI is writing code...</span>
                     </div>
                   </div>
                 )}
              </div>

              {/* AI Prompt Bar */}
              <div className="p-4 bg-[#18181b] border-t border-zinc-800">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    placeholder="Describe a component (e.g., 'A responsive navbar with dark mode')"
                    className="w-full bg-[#09090b] border border-zinc-700 text-zinc-200 pl-10 pr-24 py-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm placeholder:text-zinc-600"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Button 
                      size="sm" 
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt}
                      className="!py-1.5 !px-3"
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IdeDemo;