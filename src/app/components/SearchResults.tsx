import { Fighter } from '@/lib/types';
import { ChevronRight, User } from 'lucide-react';

interface SearchResultsProps {
  fighters: Fighter[];
  onSelectFighter: (fighter: Fighter) => void;
}

export default function SearchResults({ fighters, onSelectFighter }: SearchResultsProps) {
  if (fighters.length === 0) return null;

  return (
    <div className="mt-3 space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--neutral-400)] mb-2">
        Select a fighter
      </p>
      {fighters.slice(0, 6).map((fighter) => {
        const details = [
          fighter.nationality,
          fighter.division?.name,
        ].filter(Boolean);

        return (
          <button
            key={`search-${fighter.id}`}
            onClick={() => onSelectFighter(fighter)}
            className="group flex w-full items-center gap-3 rounded-lg border border-[var(--neutral-200)] bg-white px-3 py-2.5 text-left transition-all hover:border-[var(--primary)]/30 hover:bg-[var(--surface-muted)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--neutral-100)] text-[var(--neutral-500)] transition-colors group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]">
              <User className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
                {fighter.name}
              </p>
              {details.length > 0 && (
                <p className="text-[11px] text-[var(--neutral-500)] truncate">
                  {details.join(' · ')}
                </p>
              )}
            </div>
            
            <ChevronRight className="h-4 w-4 text-[var(--neutral-400)] transition-all group-hover:text-[var(--primary)] group-hover:translate-x-0.5" />
          </button>
        );
      })}
    </div>
  );
}
