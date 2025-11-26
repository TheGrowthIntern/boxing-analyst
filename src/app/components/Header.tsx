'use client';

import { Fighter } from '@/lib/types';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  error: string;
  selectedFighter: Fighter | null;
  onNewSearch: () => void;
}

export default function Header({ error, selectedFighter, onNewSearch }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-[var(--neutral-200)] bg-[var(--surface)] px-6 py-4">
      <div className="flex items-center gap-4">
        {selectedFighter ? (
          <button
            onClick={onNewSearch}
            className="flex items-center gap-1.5 text-[var(--neutral-500)] transition-colors hover:text-[var(--foreground)]"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-[13px]">Back</span>
          </button>
        ) : (
          <span className="text-[16px] font-semibold text-[var(--foreground)]">Mayweather</span>
        )}
        
        {selectedFighter && (
          <div className="flex items-center gap-3">
            <div className="h-4 w-px bg-[var(--neutral-200)]" />
            <span className="text-[14px] font-medium text-[var(--foreground)]">{selectedFighter.name}</span>
          </div>
        )}
      </div>
      
      {error && (
        <span className="text-[13px] text-red-500">{error}</span>
      )}
    </header>
  );
}
