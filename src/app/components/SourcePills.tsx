import { ExternalLink } from 'lucide-react';

interface SourcePillsProps {
  sources: { label: string; url: string }[];
}

export default function SourcePills({ sources }: SourcePillsProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--neutral-400)]">Sources:</span>
      {sources.map((source, idx) => (
        <a
          key={`source-${idx}`}
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-1.5 rounded-lg border border-[var(--neutral-200)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-medium text-[var(--neutral-600)] transition-all hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 hover:text-[var(--primary)]"
        >
          {source.label}
          <ExternalLink className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100" />
        </a>
      ))}
    </div>
  );
}
