import { Fighter, Fight, Analysis } from '@/lib/types';
import { renderFightBadge } from '@/lib/utils';

interface FighterProfileProps {
  fighter: Fighter;
  fights?: Fight[];
  insights?: Analysis | null;
}

/**
 * Helper: Format dates to readable "Month Day, Year" format
 */
const formatDate = (input?: string) => {
  if (!input) return 'Date unknown';
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return input; // Fallback to raw string if parsing fails
  }
  return parsed.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * FighterProfile Component
 * 
 * Displays a comprehensive fighter card including:
 * - Fighter name, alias, nationality, and division
 * - Record badge with wins-losses-draws
 * - Physical stats (height, reach, stance, age)
 * - Recent fight history
 * - AI-generated tactical analysis (strengths, weaknesses, matchups)
 */
/**
 * Helper: Format height - handles both string and number inputs
 */
const formatHeight = (height: string | number | undefined): string | null => {
  if (!height) return null;
  if (typeof height === 'string') return height;
  // Assume cm if number, convert to readable format
  const cm = Number(height);
  if (isNaN(cm)) return null;
  const feet = Math.floor(cm / 30.48);
  const inches = Math.round((cm % 30.48) / 2.54);
  return `${feet}'${inches}" (${cm}cm)`;
};

/**
 * Helper: Format reach - handles both string and number inputs
 */
const formatReach = (reach: string | number | undefined): string | null => {
  if (!reach) return null;
  if (typeof reach === 'string') return reach;
  // Assume cm if number
  const cm = Number(reach);
  if (isNaN(cm)) return null;
  const inches = Math.round(cm / 2.54);
  return `${inches}" (${cm}cm)`;
};

export default function FighterProfile({ fighter, fights, insights }: FighterProfileProps) {
  // Calculate record display
  const record = fighter.record || (fighter.wins !== undefined && fighter.losses !== undefined
    ? `${fighter.wins}-${fighter.losses}${fighter.draws ? `-${fighter.draws}` : ''}`
    : null);

  // Parse wins/losses/draws for extended color coding
  const wins = fighter.wins ?? 0;
  const losses = fighter.losses ?? 0;
  const draws = fighter.draws ?? 0;

  const koPercentage = fighter.ko_percentage || (fighter.knockouts && fighter.wins 
    ? Math.round((fighter.knockouts / fighter.wins) * 100) 
    : null);

  const age = fighter.age || (fighter.birthdate 
    ? Math.floor((new Date().getTime() - new Date(fighter.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null);

  // Format height and reach for display
  const formattedHeight = formatHeight(fighter.height);
  const formattedReach = formatReach(fighter.reach);

  return (
    <div className="mt-4 space-y-6 rounded-[10px] border border-[var(--ring-red)]/20 bg-gradient-to-br from-white via-[var(--surface-muted)] to-orange-50/30 p-6 shadow-lg shadow-[var(--ring-red)]/10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-[var(--foreground)]">{fighter.name}</h3>
            {fighter.alias && (
              <span className="text-[14px] font-medium text-[var(--ring-red)]">"{fighter.alias}"</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-[var(--neutral-600)]">
            {fighter.nationality && <span className="font-medium">{fighter.nationality}</span>}
            {fighter.nationality && fighter.division?.name && <span>·</span>}
            {fighter.division?.name && <span>{fighter.division.name}</span>}
          </div>
          {(fighter.birthplace || fighter.residence) && (
            <p className="mt-1 text-[12px] text-[var(--neutral-400)]">
              {[fighter.birthplace, fighter.residence].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        {record && (
          <div className="flex flex-col items-end gap-2">
            {/* Main record badge with orange background */}
            <div className="rounded-[10px] bg-[var(--groq-orange)] px-4 py-1.5 shadow-md">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-white">{wins}</span>
                <span className="text-[13px] font-medium text-white/70">-</span>
                <span className="text-[13px] font-bold text-white">{losses}</span>
                {draws > 0 && (
                  <>
                    <span className="text-[13px] font-medium text-white/70">-</span>
                    <span className="text-[13px] font-bold text-white">{draws}</span>
                  </>
                )}
              </div>
            </div>
            {fighter.status && (
              <p className={`text-[11px] font-medium uppercase tracking-wider ${
                fighter.status.toLowerCase() === 'active' ? 'text-[var(--groq-orange)]' : 'text-[var(--neutral-400)]'
              }`}>
                {fighter.status}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Height', value: formattedHeight },
          { label: 'Reach', value: formattedReach },
          { label: 'Stance', value: fighter.stance },
          { label: 'Age', value: age },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[10px] bg-white/80 backdrop-blur-sm shadow-sm p-3 text-center border border-[var(--ring-red)]/10 hover:border-[var(--ring-red)]/30 transition-colors">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--neutral-500)]">{stat.label}</p>
            <p className="mt-1 text-[15px] font-semibold text-[var(--foreground)]">{stat.value || '—'}</p>
          </div>
        ))}
      </div>

      {/* KO Stats */}
      {fighter.knockouts !== undefined && (
        <div className="flex items-center gap-4 text-[13px]">
          <span className="text-[var(--neutral-500)]">
            <span className="font-semibold text-[var(--foreground)]">{fighter.knockouts}</span> KOs
            {koPercentage && <span className="text-[var(--neutral-400)]"> ({koPercentage}%)</span>}
          </span>
          {fighter.debut && (
            <>
              <span className="text-[var(--neutral-300)]">·</span>
              <span className="text-[var(--neutral-500)]">
                Pro since <span className="text-[var(--foreground)]">{fighter.debut}</span>
              </span>
            </>
          )}
        </div>
      )}

      {/* Titles */}
      {fighter.titles && fighter.titles.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--neutral-500)]">Championships</p>
          <div className="flex flex-wrap gap-2">
            {fighter.titles.map((title, index) => (
              <span key={`title-${index}`} className="rounded-[10px] border border-amber-200 bg-amber-50 px-2.5 py-1 text-[12px] font-medium text-amber-700">
                {title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Fights */}
      {fights && fights.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--neutral-500)]">Recent Fights</p>
          <div className="space-y-2">
            {fights.slice(0, 5).map((fight) => (
              <div key={`fight-${fight.id}`} className="flex items-center justify-between rounded-[10px] bg-white px-4 py-3 border border-[var(--neutral-200)] shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] text-[var(--foreground)]">
                      vs {typeof fight.opponent === 'string' ? fight.opponent : fight.opponent?.name}
                    </p>
                    {fight.title_fight && (
                      <span className="bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                        TITLE
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12px] text-[var(--neutral-500)]">
                    {formatDate(fight.date)}
                    {fight.method && ` · ${fight.method}`}
                    {fight.round && ` R${fight.round}`}
                  </p>
                </div>
                <span className={renderFightBadge(fight.result)}>{fight.result}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights && (
        <div className="space-y-4 border-t border-[var(--ring-red)]/20 pt-6">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--ring-red)]">AI-Powered Analysis</p>
          
          <p className="text-[14px] leading-relaxed text-[var(--neutral-700)]">{insights.summary}</p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-[10px] bg-orange-50/50 p-3 border border-orange-200/50">
              <p className="text-[12px] font-semibold text-orange-600">Strengths</p>
              <ul className="space-y-1.5 text-[13px] text-[var(--neutral-700)]">
                {insights.strengths?.length ? (
                  insights.strengths.map((strength, index) => (
                    <li key={`strength-${index}`} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 bg-orange-500" />
                      {strength}
                    </li>
                  ))
                ) : (
                  <li className="text-[var(--neutral-400)]">Not available</li>
                )}
              </ul>
            </div>
            <div className="space-y-2 rounded-[10px] bg-red-50/50 p-3 border border-red-200/50">
              <p className="text-[12px] font-semibold text-[var(--ring-red)]">Weaknesses</p>
              <ul className="space-y-1.5 text-[13px] text-[var(--neutral-700)]">
                {insights.weaknesses?.length ? (
                  insights.weaknesses.map((weakness, index) => (
                    <li key={`weakness-${index}`} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 bg-[var(--ring-red)]" />
                      {weakness}
                    </li>
                  ))
                ) : (
                  <li className="text-[var(--neutral-400)]">Not available</li>
                )}
              </ul>
            </div>
          </div>

          {(insights.style || insights.matchups) && (
            <div className="grid gap-4 md:grid-cols-2">
              {insights.style && (
                <div>
                  <p className="text-[12px] font-medium text-[var(--foreground)]">Fighting Style</p>
                  <p className="mt-1 text-[13px] text-[var(--neutral-500)]">{insights.style}</p>
                </div>
              )}
              {insights.matchups && (
                <div>
                  <p className="text-[12px] font-medium text-[var(--foreground)]">Strategic Notes</p>
                  <p className="mt-1 text-[13px] text-[var(--neutral-500)]">{insights.matchups}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
