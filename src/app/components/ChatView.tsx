'use client';

import { RefObject } from 'react';
import { Fighter } from '@/lib/types';
import Header from './Header';
import ChatMessage, { type ChatMessage as ChatMessageType } from './ChatMessage';
import ChatInput from './ChatInput';
import ThinkingSteps from './ThinkingSteps';

interface ChatViewProps {
  // State
  chatHistory: ChatMessageType[];
  inputValue: string;
  selectedFighter: Fighter | null;
  contextFighter: Fighter | null;
  isSearching: boolean;
  isAnalyzing: boolean;
  isCompoundLoading: boolean;
  isLoading: boolean;
  isInitialState: boolean;
  error: string;
  bottomRef: RefObject<HTMLDivElement | null>;
  
  // Actions
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onSelectFighter: (fighter: Fighter) => void;
  onNewSearch: () => void;
  onRandomFighter: () => void;
}

/**
 * Main chat interface component.
 * Displays message history, loading states, and input controls.
 */
export default function ChatView({
  chatHistory,
  inputValue,
  selectedFighter,
  contextFighter,
  isSearching,
  isAnalyzing,
  isCompoundLoading,
  isLoading,
  isInitialState,
  error,
  bottomRef,
  onInputChange,
  onSubmit,
  onSelectFighter,
  onNewSearch,
  onRandomFighter,
}: ChatViewProps) {
  return (
    <main className="flex h-screen flex-col bg-[var(--background)] animate-fade-in relative">
      {/* ─────────────────────────────────────────────────────────────
          Background Layers
          ───────────────────────────────────────────────────────────── */}
      <div className="app-bg" />
      <div className="app-grid" />
      <div className="app-ropes" />
      
      {/* ─────────────────────────────────────────────────────────────
          Header
          ───────────────────────────────────────────────────────────── */}
      <Header error={error} />
      
      {/* ─────────────────────────────────────────────────────────────
          Chat Content Area
          ───────────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col relative z-[1]">
        {/* Scrollable Message List */}
        <div className="chat-scroll flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4">
            {/* Messages */}
            {chatHistory.map((message, index) => (
              <div 
                key={message.id} 
                className="animate-slide-in"
                style={{ 
                  animationDelay: `${Math.min(index * 30, 150)}ms`, 
                  opacity: 0 
                }}
              >
                <ChatMessage 
                  message={message} 
                  onSelectFighter={onSelectFighter} 
                />
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="animate-fade-in">
                <ThinkingSteps
                  isSearching={isSearching}
                  isAnalyzing={isAnalyzing}
                  isThinking={isCompoundLoading}
                  fighterName={selectedFighter?.name}
                />
              </div>
            )}
            
            {/* Scroll Anchor */}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            Input Area
            ───────────────────────────────────────────────────────────── */}
        <ChatInput
          inputValue={inputValue}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
          disabled={isLoading}
          selectedFighter={selectedFighter}
          contextFighter={contextFighter}
          onNewSearch={onNewSearch}
          onRandomFighter={onRandomFighter}
          isInitialState={isInitialState}
        />
      </div>
    </main>
  );
}

