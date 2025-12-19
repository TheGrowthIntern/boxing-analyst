'use client';

import { ArrowUp, Shuffle, Plus } from 'lucide-react';
import { Fighter } from '@/lib/types';
import GroqLogo from './GroqLogo';

interface ChatInputProps {
  /** Current input value */
  inputValue: string;
  /** Callback when input changes */
  onInputChange: (value: string) => void;
  /** Form submission handler */
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Whether input should be disabled (during loading) */
  disabled: boolean;
  /** Currently selected fighter for context */
  selectedFighter: Fighter | null;
  /** Fighter context preserved for follow-ups */
  contextFighter: Fighter | null;
  /** Reset to fresh chat state */
  onNewSearch: () => void;
  /** Pick a random famous boxer */
  onRandomFighter: () => void;
  /** Whether this is the initial empty state */
  isInitialState: boolean;
}

/**
 * Chat input component with contextual action buttons.
 * Shows "Surprise me" in initial state, "New chat" after interactions.
 * Displays dynamic placeholder based on fighter context.
 */
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
  // Derived state
  const hasInput = inputValue.trim().length > 0;
  const showDiscover = isInitialState && !hasInput; // "Surprise me" button
  const showNew = !isInitialState; // "New chat" button
  
  return (
    <div className="relative z-[1] px-6 py-6 pointer-events-none">
      <form onSubmit={onSubmit} className="mx-auto max-w-[720px] pointer-events-auto">
        {/* Main input container */}
        <div className="relative flex items-center gap-2 rounded-[10px] border border-[var(--neutral-200)] bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          {/* Action buttons inside input */}
          <div className="flex items-center pl-2">
            {showDiscover && (
              <button
                type="button"
                onClick={onRandomFighter}
                disabled={disabled}
                className="flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium text-[var(--neutral-500)] transition-all"
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
                className="flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium text-[var(--neutral-500)]"
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
            disabled={disabled}
             placeholder={
               selectedFighter
                 ? `Ask about ${selectedFighter.name}...`
                 : contextFighter
                 ? `Continue asking about ${contextFighter.name}...`
                 : 'Try "Katie Taylor" or "What big fights are coming up?"...'
             }
            className="flex-1 bg-transparent px-3 py-3.5 text-[15px] text-[var(--foreground)] focus:outline-none focus:ring-0 disabled:opacity-50"
          />
          
          {/* Submit button */}
          <div className="pr-2">
            <button
              type="submit"
              disabled={disabled || !hasInput}
              className={`flex h-9 w-9 items-center justify-center rounded-[10px] transition-all duration-200 ${
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
        <div className="mt-4 flex justify-center">
          <span className="flex items-center gap-1 text-[11px] text-[var(--neutral-400)]">
            Powered by
            <GroqLogo className="scale-50 origin-left" />
          </span>
        </div>
      </form>
    </div>
  );
}
