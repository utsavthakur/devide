import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { APP_NAME } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-900 bg-black pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-white mb-4">
              {/* Updated Gradient: Red -> Purple */}
              <div className="bg-gradient-to-br from-red-600 via-purple-600 to-indigo-900 p-1.5 rounded-lg shadow-lg shadow-red-500/20 ring-1 ring-white/10">
                {/* Custom Quantum Core Processor Logo */}
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="3" className="opacity-90" />
                  <path d="M9 9h6v6H9z" className="fill-white/20" />
                  <path d="M9 1h6" strokeWidth="1.5" />
                  <path d="M9 23h6" strokeWidth="1.5" />
                  <path d="M1 9v6" strokeWidth="1.5" />
                  <path d="M23 9v6" strokeWidth="1.5" />
                  <path d="M12 4v5" />
                  <path d="M12 15v5" />
                  <path d="M4 12h5" />
                  <path d="M15 12h5" />
                </svg>
              </div>
              {APP_NAME}
            </div>
            <p className="text-zinc-400 text-sm max-w-xs leading-relaxed mb-6">
              The next generation browser-based IDE. Built for the modern web, powered by AI, designed for speed.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-red-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-red-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-red-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Legal</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} Codexia Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-zinc-300">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;