import { Fighter } from '@/lib/types';
import { ChevronRight } from 'lucide-react';

interface SearchResultsProps {
  fighters: Fighter[];
  onSelectFighter: (fighter: Fighter) => void;
}

export default function SearchResults({ fighters, onSelectFighter }: SearchResultsProps) {
  if (fighters.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      {fighters.slice(0, 6).map((fighter) => {
        const details = [
          fighter.nationality,
          fighter.division?.name,
          fighter.birthplace || fighter.residence,
        ].filter(Boolean);

        return (
          <button
            key={`search-${fighter.id}`}
            onClick={() => onSelectFighter(fighter)}
            className="group flex w-full items-center justify-between rounded-xl border border-[var(--neutral-200)] bg-[var(--surface)] px-4 py-3.5 text-left transition-all hover:border-[var(--neutral-300)] hover:bg-[var(--surface-muted)]"
          >
            <div>
              <p className="text-[14px] font-medium text-[var(--foreground)]">{fighter.name}</p>
              {details.length > 0 && (
                <p className="mt-0.5 text-[12px] text-[var(--neutral-500)]">
                  {details.join(' · ')}
                </p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--neutral-400)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--neutral-600)]" />
          </button>
        );
      })}
    </div>
  );
}
