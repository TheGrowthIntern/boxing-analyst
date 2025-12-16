'use client';

import { ExternalLink } from 'lucide-react';

interface HeaderProps {
  error: string;
}

export default function Header({ error }: HeaderProps) {
  return (
    <header className="relative z-[1] flex items-center justify-between border-b border-[var(--neutral-200)] bg-[var(--surface)]/95 backdrop-blur-sm px-6 py-3">
      <span className="text-[15px] font-semibold text-[var(--foreground)]">The Bottom Line</span>
      
      <div className="flex items-center gap-4">
        {error && (
          <span className="text-[13px] text-red-500">{error}</span>
        )}
        
        <a
          href="https://console.groq.com/playground"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-[var(--neutral-200)] bg-[var(--surface)]/80 backdrop-blur-sm px-3 py-1.5 text-[12px] font-medium text-[var(--neutral-600)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--surface)]"
        >
          Try Groq
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </header>
  );
}
