'use client';

import { ArrowUp, Shuffle } from 'lucide-react';
import { Fighter } from '@/lib/types';

interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
  selectedFighter: Fighter | null;
  onNewSearch: () => void;
  onRandomFighter: () => void;
}

export default function ChatInput({ 
  inputValue, 
  onInputChange, 
  onSubmit, 
  disabled,
  selectedFighter,
  onRandomFighter,
}: ChatInputProps) {
  const hasInput = inputValue.trim().length > 0;
  
  return (
    <div className="border-t border-[var(--neutral-200)] bg-[var(--surface)] px-6 py-4">
      <form onSubmit={onSubmit} className="mx-auto max-w-[720px]">
        <div className="flex items-center gap-3">
          {/* Discover button */}
          <button
            type="button"
            onClick={onRandomFighter}
            disabled={disabled}
            className="flex h-12 items-center gap-2 rounded-xl border border-[var(--neutral-200)] bg-[var(--background)] px-4 text-[13px] font-medium text-[var(--neutral-600)] transition-all hover:border-[var(--neutral-300)] hover:bg-[var(--surface-muted)] disabled:opacity-50"
          >
            <Shuffle className="h-4 w-4" />
            <span className="hidden sm:inline">Discover</span>
          </button>

          {/* Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={selectedFighter 
                ? `Ask about ${selectedFighter.name}...` 
                : "Search for a boxer..."
              }
              className="w-full rounded-xl border border-[var(--neutral-200)] bg-[var(--background)] px-4 py-3.5 text-[15px] text-[var(--foreground)] placeholder:text-[var(--neutral-400)] transition-colors focus:border-[var(--neutral-300)] focus:outline-none"
            />
          </div>
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={disabled || !hasInput}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
              hasInput && !disabled
                ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
                : 'bg-[var(--neutral-100)] text-[var(--neutral-400)]'
            }`}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
        
        <p className="mt-2 text-center text-[12px] text-[var(--neutral-400)]">
          {selectedFighter 
            ? `Chatting about ${selectedFighter.name}`
            : 'Type a boxer name to search'
          }
        </p>
      </form>
    </div>
  );
}
