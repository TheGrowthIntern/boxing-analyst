'use client';

import { ExternalLink } from 'lucide-react';


interface HeaderProps {
  /** Error message to display (empty string if no error) */
  error: string;
}

/**
 * Minimal header with app title and Groq link.
 * Displays error messages when present.
 */
export default function Header({ error }: HeaderProps) {
  return (
    <header className="relative z-[1] flex items-center justify-between px-6 py-4">
      <span className="text-[15px] font-semibold text-[var(--foreground)]">The Bottom Line</span>
      
      <div className="flex items-center gap-4">
        {error && (
          <span className="text-[13px] text-red-500">{error}</span>
        )}
        
        <a
          href="https://console.groq.com/playground"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-[var(--neutral-200)] bg-[var(--surface)]/80 backdrop-blur-sm px-3 py-1.5 text-[14px] font-medium text-[var(--neutral-600)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--surface)]"
        >
          Try Groq
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </header>
  );
}
