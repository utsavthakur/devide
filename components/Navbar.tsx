import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Button from './Button';
import { APP_NAME } from '../constants';

interface NavbarProps {
  onStartCoding?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onStartCoding }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-panel border-b border-white/5 py-4' : 'bg-transparent py-6'
        }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-white group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          {/* Updated Gradient: Red -> Purple */}
          <div className="bg-gradient-to-br from-red-600 via-purple-600 to-indigo-900 p-2 rounded-lg shadow-lg shadow-red-500/20 ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-300">
            {/* Custom Quantum Core Processor Logo */}
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          {/* Updated Text Gradient */}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-red-200 group-hover:to-white transition-all">
            {APP_NAME}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">Demo</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#blog" className="hover:text-white transition-colors">Blog</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">Sign In</button>
          <Button variant="primary" size="sm" onClick={onStartCoding}>Get Started</Button>
        </div>

        <button
          className="md:hidden text-zinc-400"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-panel border-b border-white/5 p-6 animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-4">
            <a href="#features" className="text-zinc-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#demo" className="text-zinc-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Demo</a>
            <a href="#pricing" className="text-zinc-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
            <hr className="border-zinc-800" />
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full">Sign In</Button>
              <Button variant="primary" className="w-full" onClick={() => { setIsMobileMenuOpen(false); if (onStartCoding) onStartCoding(); }}>Get Started</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;