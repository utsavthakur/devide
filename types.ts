import React from 'react';

export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

export enum IdeTab {
  CODE = 'CODE',
  PREVIEW = 'PREVIEW',
  TERMINAL = 'TERMINAL',
}

// Voice IDE Types
export interface VoiceSession {
  isActive: boolean;
  isListening: boolean;
  currentTranscript: string;
  conversationHistory: ConversationEntry[];
}

export interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface FileSystem {
  [key: string]: string;
}

export interface FileOperation {
  type: 'update_file' | 'switch_file';
  path: string;
  content?: string;
}