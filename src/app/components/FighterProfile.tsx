import { Fighter, Fight, Analysis } from '@/lib/types';
import { renderFightBadge } from '@/lib/utils';

interface FighterProfileProps {
  fighter: Fighter;
  fights?: Fight[];
  insights?: Analysis | null;
}

export default function FighterProfile({ fighter, fights, insights }: FighterProfileProps) {
  const record = fighter.record || (fighter.wins !== undefined && fighter.losses !== undefined
    ? `${fighter.wins}-${fighter.losses}${fighter.draws ? `-${fighter.draws}` : ''}`
    : null);

  const koPercentage = fighter.ko_percentage || (fighter.knockouts && fighter.wins 
    ? Math.round((fighter.knockouts / fighter.wins) * 100) 
    : null);

  const age = fighter.age || (fighter.birthdate 
    ? Math.floor((new Date().getTime() - new Date(fighter.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null);

  return (
    <div className="mt-4 space-y-6 rounded-2xl border border-[var(--neutral-200)] bg-gradient-to-br from-white to-[var(--surface-muted)] p-6 shadow-lg shadow-black/5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-[var(--foreground)]">{fighter.name}</h3>
            {fighter.alias && (
              <span className="text-[14px] text-[var(--neutral-500)]">"{fighter.alias}"</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-[var(--neutral-500)]">
            {fighter.nationality && <span>{fighter.nationality}</span>}
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
          <div className="text-right">
            <span className="text-2xl font-bold text-[var(--primary)]">{record}</span>
            {fighter.status && (
              <p className={`mt-1 text-[11px] font-medium uppercase tracking-wider ${
                fighter.status === 'active' ? 'text-green-600' : 'text-[var(--neutral-400)]'
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
          { label: 'Height', value: fighter.height },
          { label: 'Reach', value: fighter.reach },
          { label: 'Stance', value: fighter.stance },
          { label: 'Age', value: age },
        ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-white shadow-sm p-3 text-center border border-[var(--neutral-200)]">
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
              <span key={`title-${index}`} className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[12px] font-medium text-amber-700">
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
              <div key={`fight-${fight.id}`} className="flex items-center justify-between rounded-lg bg-white px-4 py-3 border border-[var(--neutral-200)] shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] text-[var(--foreground)]">
                      vs {typeof fight.opponent === 'string' ? fight.opponent : fight.opponent?.name}
                    </p>
                    {fight.title_fight && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                        TITLE
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12px] text-[var(--neutral-500)]">
                    {fight.date}
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
        <div className="space-y-4 border-t border-[var(--neutral-200)] pt-6">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--neutral-500)]">AI Analysis</p>
          
          <p className="text-[14px] leading-relaxed text-[var(--neutral-600)]">{insights.summary}</p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[12px] font-medium text-green-600">Strengths</p>
              <ul className="space-y-1.5 text-[13px] text-[var(--neutral-600)]">
                {insights.strengths?.length ? (
                  insights.strengths.map((strength, index) => (
                    <li key={`strength-${index}`} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-green-500" />
                      {strength}
                    </li>
                  ))
                ) : (
                  <li className="text-[var(--neutral-400)]">Not available</li>
                )}
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-[12px] font-medium text-red-500">Weaknesses</p>
              <ul className="space-y-1.5 text-[13px] text-[var(--neutral-600)]">
                {insights.weaknesses?.length ? (
                  insights.weaknesses.map((weakness, index) => (
                    <li key={`weakness-${index}`} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-400" />
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
