import { ExternalLink } from 'lucide-react';

interface SourcePillsProps {
  sources: { label: string; url: string }[];
}

export default function SourcePills({ sources }: SourcePillsProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--neutral-400)]">
        Sources
      </span>
      {sources.map((source, idx) => (
        <a
          key={`source-${idx}`}
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-1.5 rounded-[10px] border border-[var(--neutral-200)] bg-white/90 px-3.5 py-1.5 text-[11px] font-medium text-[var(--neutral-700)] shadow-sm transition-all hover:border-[var(--ring-red)]/40 hover:text-[var(--ring-red)]"
        >
          {source.label}
          <ExternalLink className="h-3 w-3 opacity-50 transition-all group-hover:opacity-90" />
        </a>
      ))}
    </div>
  );
}
