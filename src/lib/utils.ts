import { Fight } from './types';
import clsx from 'clsx';

/**
 * Returns CSS classes for styling fight result badges
 */
export function renderFightBadge(result: Fight['result']): string {
  const normalizedResult = typeof result === 'string' ? result.toLowerCase() : result;
  
  return clsx(
    'px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide',
    (normalizedResult === 'win' || normalizedResult === 'w') && 'bg-green-100 text-green-700',
    (normalizedResult === 'loss' || normalizedResult === 'l') && 'bg-red-100 text-red-600',
    (normalizedResult === 'draw' || normalizedResult === 'd') && 'bg-amber-100 text-amber-700',
    (normalizedResult === 'nc' || normalizedResult === 'no contest') && 'bg-[var(--neutral-100)] text-[var(--neutral-500)]',
    !['win', 'w', 'loss', 'l', 'draw', 'd', 'nc', 'no contest'].includes(normalizedResult) && 'bg-[var(--neutral-100)] text-[var(--neutral-500)]',
  );
}
