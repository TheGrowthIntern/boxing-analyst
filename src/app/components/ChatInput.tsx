'use client';

import { ArrowUp, Shuffle, Plus } from 'lucide-react';
import { Fighter } from '@/lib/types';

interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
  selectedFighter: Fighter | null;
  contextFighter: Fighter | null;
  onNewSearch: () => void;
  onRandomFighter: () => void;
  isInitialState: boolean;
}

export default function ChatInput({ 
  inputValue, 
  onInputChange, 
  onSubmit, 
  disabled,
  selectedFighter,
  contextFighter,
  onNewSearch,
  onRandomFighter,
  isInitialState,
}: ChatInputProps) {
  const hasInput = inputValue.trim().length > 0;
  
  // Show "Surprise me" only in initial state (first message)
  const showDiscover = isInitialState && !hasInput;
  // Show "New chat" after any interaction
  const showNew = !isInitialState;
  
  return (
    <div className="relative z-[1] border-t border-[var(--neutral-200)]/50 bg-gradient-to-t from-[var(--surface)] to-[var(--surface)]/95 backdrop-blur-md px-6 py-4">
      <form onSubmit={onSubmit} className="mx-auto max-w-[720px]">
        {/* Main input container */}
        <div className="relative flex items-center gap-2 rounded-2xl border border-[var(--neutral-200)] bg-white shadow-sm transition-all">
          {/* Action buttons inside input */}
          <div className="flex items-center pl-2">
            {showDiscover && (
              <button
                type="button"
                onClick={onRandomFighter}
                disabled={disabled}
                className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] font-medium text-[var(--neutral-500)] transition-all"
              >
                <Shuffle className="h-4 w-4" />
                <span className="hidden sm:inline">Surprise me</span>
              </button>
            )}

            {showNew && (
              <button
                type="button"
                onClick={onNewSearch}
                disabled={disabled}
                className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] font-medium text-[var(--neutral-500)]"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New chat</span>
              </button>
            )}
          </div>

          {/* Divider */}
          {(showDiscover || showNew) && (
            <div className="h-6 w-px bg-[var(--neutral-200)]" />
          )}

          {/* Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={
              selectedFighter
                ? `Ask about ${selectedFighter.name}...`
                : contextFighter
                ? `Continue asking about ${contextFighter.name}...`
                : 'Search a boxer or ask anything...'
            }
            className="flex-1 bg-transparent px-3 py-3.5 text-[15px] text-[var(--foreground)] focus:outline-none focus:ring-0"
          />
          
          {/* Submit button */}
          <div className="pr-2">
            <button
              type="submit"
              disabled={disabled || !hasInput}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
                hasInput && !disabled
                  ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
                  : 'bg-[var(--neutral-100)] text-[var(--neutral-400)]'
              }`}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Powered by footer */}
        <div className="mt-2 text-center">
          <span className="text-[11px] text-[var(--neutral-400)]">
            Powered by <span className="font-medium text-[var(--primary)]">Groq</span>
          </span>
        </div>
      </form>
    </div>
  );
}
