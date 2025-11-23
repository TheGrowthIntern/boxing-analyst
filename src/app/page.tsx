'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { Fighter, Fight, Analysis } from '@/lib/types';
import clsx from 'clsx';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  meta?: {
    searchResults?: Fighter[];
    fighter?: Fighter;
    fights?: Fight[];
    insights?: Analysis | null;
    sources?: { label: string; url: string }[];
  };
};

const questionKeywords = [
  'how',
  'what',
  'why',
  'when',
  'where',
  'should',
  'can',
  'does',
  'do',
  'is',
  'are',
  'tell',
  'give',
  'compare',
  'rate',
  'versus',
  'vs',
];

const renderFightBadge = (result: Fight['result']) =>
  clsx(
    'px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase',
    result === 'win' && 'bg-[var(--accent-orange)] text-white',
    result === 'loss' && 'bg-[var(--primary-orange)] text-white',
    result === 'draw' && 'bg-[var(--gray-light)] text-[#000]',
    result === 'nc' && 'bg-[var(--gray-medium)] text-white',
  );

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFighter, setSelectedFighter] = useState<Fighter | null>(null);
  const [recentFights, setRecentFights] = useState<Fight[]>([]);
  const [insights, setInsights] = useState<Analysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Compound Beta is ready. Type a fighter name to pull up stats.',
    },
  ]);
  const chatAreaRef = useRef<HTMLDivElement | null>(null);
  const [isCompoundLoading, setIsCompoundLoading] = useState(false);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [chatHistory, isSearching, isAnalyzing, isCompoundLoading]);

  const appendMessage = (message: ChatMessage) => {
    setChatHistory((prev) => [...prev, message]);
  };

  const performSearch = async (searchTerm: string) => {
    setIsSearching(true);
    setError('');
    setSelectedFighter(null);
    setRecentFights([]);
    setInsights(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const fighters: Fighter[] = data.fighters || [];

      if (fighters.length === 0) {
        setError('No fighters found.');
      }

      appendMessage({
        id: `search-res-${Date.now()}`,
        role: 'assistant',
        content: fighters.length
          ? `I found ${fighters.length} match${fighters.length === 1 ? '' : 'es'} for "${searchTerm}". Tap one to load the profile card.`
          : `No one matched "${searchTerm}". Try another name or spelling.`,
        meta: { searchResults: fighters },
      });
    } catch (err) {
      setError('Failed to search fighters.');
      appendMessage({
        id: `search-error-${Date.now()}`,
        role: 'assistant',
        content: 'Compound Beta hit a snag fetching fighters—give it another try.',
      });
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFighter = async (fighter: Fighter) => {
    appendMessage({
      id: `user-select-${fighter.id}-${Date.now()}`,
      role: 'user',
      content: fighter.name,
    });

    setSelectedFighter(fighter);
    setIsAnalyzing(true);
    setError('');
    setRecentFights([]);
    setInsights(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fighterId: fighter.id }),
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      const profile: Fighter = data.fighter || fighter;
      setSelectedFighter(profile);
      setRecentFights(data.fights || []);
      setInsights(data.insights || null);

      appendMessage({
        id: `profile-${fighter.id}-${Date.now()}`,
        role: 'assistant',
        content: `Compound Beta loaded the profile for ${profile.name}.`,
        meta: {
          fighter: profile,
          fights: data.fights || [],
          insights: data.insights || null,
        },
      });
    } catch (err) {
      setError('Failed to analyze fighter.');
      appendMessage({
        id: `profile-error-${fighter.id}-${Date.now()}`,
        role: 'assistant',
        content: 'Compound Beta could not retrieve the fighter profile. Try another selection.',
      });
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendCompoundQuestion = async (questionText: string) => {
    if (!selectedFighter) return;
    setIsCompoundLoading(true);
    try {
      const res = await fetch('/api/compound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fighterId: selectedFighter.id,
          question: questionText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Compound question failed');
      }

      appendMessage({
        id: `compound-res-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'Compound Beta could not answer that right now.',
        meta: {
          sources: data.sources,
        },
      });
    } catch (err) {
      appendMessage({
        id: `compound-error-${Date.now()}`,
        role: 'assistant',
        content: 'Compound Beta could not process the follow-up question. Try again shortly.',
      });
      console.error(err);
    } finally {
      setIsCompoundLoading(false);
    }
  };
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setInputValue('');

    appendMessage({
      id: `compound-user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    });

    const hasQuestionMark = trimmed.includes('?');
    const normalized = trimmed.toLowerCase();
    const startsWithKeyword = questionKeywords.some(
      (keyword) => normalized === keyword || normalized.startsWith(`${keyword} `),
    );
    const isQuestionIntent = hasQuestionMark || startsWithKeyword;

    if (selectedFighter && isQuestionIntent) {
      await sendCompoundQuestion(trimmed);
    } else {
      await performSearch(trimmed);
    }
  };

  const statusLabel = isSearching
    ? 'Searching for fighters…'
    : isAnalyzing
    ? 'Analyzing fighter data…'
    : isCompoundLoading
    ? 'Compound Beta is crafting a response…'
    : 'Type a fighter name or ask a question after selecting one';

  return (
    //main container
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#fff4ec] via-[#fff8f2] to-[#ffffff] font-[var(--font-geist-sans)] text-[var(--foreground)]">
      <div className="flex-1 px-4 py-10 md:px-8">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-8 rounded-[14px] border border-[var(--gray-light)] bg-white/70 px-6 py-8 shadow-lg shadow-[#000]/10 backdrop-blur-sm">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.6em] text-[var(--primary-orange)]">Groq Compound Beta</p>
            <h1 className="text-4xl font-black text-[var(--foreground)]">Boxing Analyst Chat</h1>
            <p className="text-sm text-[var(--gray-dark)]">
              Search by typing a fighter's name and pick the correct profile. Compound Beta responds directly within this room while leaving plenty of white space for the chat.
            </p>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--gray-medium)]">{statusLabel}</p>
            {error && (
              <div className="rounded-lg border border-[var(--primary-orange)] bg-[var(--accent-peach)]/60 px-4 py-2 text-sm text-[var(--primary-orange)] shadow-inner">
                {error}
              </div>
            )}
            </header>
          <div className="flex min-h-0 flex-1 flex-col rounded-[12px] border border-[var(--gray-light)] bg-white/80">       
            <div ref={chatAreaRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-5 pb-4">
                {chatHistory.map((message) => {
                  const isUser = message.role === 'user';
                  return (
                    <div
                      key={message.id}
                    className={clsx('space-y-2 rounded-lg border px-4 py-3', {
                        'border-[var(--primary-orange)] bg-[var(--accent-peach)] text-[var(--primary-orange)]': isUser,
                        'border-[var(--gray-light)] bg-white text-[var(--foreground)]': !isUser,
                      })}
                    >
                      <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--gray-medium)]">
                        {isUser ? 'You' : 'Compound Beta'}
                      </p>
                      <p className="text-sm leading-relaxed">{message.content}</p>

                      {message.meta?.searchResults && message.meta.searchResults.length > 0 && (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {message.meta.searchResults.slice(0, 4).map((fighter) => (
                            <button
                              key={`search-${fighter.id}`}
                              onClick={() => handleSelectFighter(fighter)}
                              className="flex items-center justify-between rounded-xl border border-[var(--gray-light)] bg-[var(--accent-light)] px-3 py-2 text-left text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary-orange)]"
                            >
                              <span>
                                {fighter.name}
                                <span className="block text-[11px] font-normal text-[var(--gray-dark)]">
                                  {fighter.nationality} {fighter.division?.name ? `• ${fighter.division.name}` : ''}
                                </span>
                              </span>
                              <span className="text-[11px] uppercase tracking-[0.3em] text-[var(--primary-orange)]">Select</span>
                            </button>
                          ))}
                        </div>
                      )}
                    {message.meta?.fighter && (
                      <div className="space-y-3 rounded-xl border border-[var(--gray-light)] bg-[var(--accent-light)] px-4 py-3 text-sm text-[var(--foreground)]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-[var(--foreground)]">{message.meta.fighter.name}</p>
                            <p className="text-[11px] text-[var(--gray-medium)]">
                              {message.meta.fighter.nationality} {message.meta.fighter.division?.name ?? ''}
                            </p>
                          </div>
                          <span className="rounded-full border border-[var(--gray-light)] px-3 py-1 text-[11px] font-semibold text-[var(--primary-orange)]">
                            {message.meta.fighter.record || 'Record N/A'}
                          </span>
                        </div>
                        <div className="grid gap-3 text-[11px] text-[var(--gray-dark)] md:grid-cols-3">
                          <div>
                            <p className="uppercase tracking-[0.3em]">Height</p>
                            <p className="font-semibold text-[var(--foreground)]">{message.meta.fighter.height || '-'}</p>
                          </div>
                          <div>
                            <p className="uppercase tracking-[0.3em]">Reach</p>
                            <p className="font-semibold text-[var(--foreground)]">{message.meta.fighter.reach || '-'}</p>
                          </div>
                          <div>
                            <p className="uppercase tracking-[0.3em]">Stance</p>
                            <p className="font-semibold text-[var(--foreground)]">{message.meta.fighter.stance || '-'}</p>
                          </div>
                        </div>
                        {message.meta.fights && message.meta.fights.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--gray-medium)]">Recent fights</p>
                            {message.meta.fights.slice(0, 3).map((fight) => (
                              <div key={`fight-${fight.id}`} className="flex items-center justify-between text-[12px]">
                                <div>
                                  <p className="font-semibold text-[var(--foreground)]">
                                    vs {typeof fight.opponent === 'string' ? fight.opponent : fight.opponent?.name}
                                  </p>
                                  <p className="text-[11px] text-[var(--gray-medium)]">
                                    {fight.date} • {fight.method || 'Method N/A'}
                                  </p>
                                </div>
                                <span className={renderFightBadge(fight.result)}>{fight.result}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {message.meta.insights && (
                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--gray-medium)]">AI insights</p>
                            <p className="text-[12px] text-[var(--foreground)]">{message.meta.insights.summary}</p>
                            <div className="grid gap-3 text-[12px] text-[var(--gray-dark)] md:grid-cols-2">
                              <div>
                                <p className="uppercase tracking-[0.3em]">Strengths</p>
                                <ul className="space-y-1">
                                  {message.meta.insights.strengths?.length ? (
                                    message.meta.insights.strengths.map((strength, index) => (
                                      <li key={`strength-${index}`}>• {strength}</li>
                                    ))
                                  ) : (
                                    <li>Not listed</li>
                                  )}
                                </ul>
                              </div>
                              <div>
                                <p className="uppercase tracking-[0.3em]">Weaknesses</p>
                                <ul className="space-y-1">
                                  {message.meta.insights.weaknesses?.length ? (
                                    message.meta.insights.weaknesses.map((weakness, index) => (
                                      <li key={`weakness-${index}`}>• {weakness}</li>
                                    ))
                                  ) : (
                                    <li>Not listed</li>
                                  )}
                                </ul>
                              </div>
                            </div>
                            <div className="grid gap-3 text-[12px] text-[var(--gray-dark)] md:grid-cols-2">
                              <div>
                                <p className="font-semibold text-[var(--foreground)]">Style</p>
                                <p>{message.meta.insights.style || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-[var(--foreground)]">Strategic notes</p>
                                <p>{message.meta.insights.matchups || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {message.meta?.sources && message.meta.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.meta.sources.map((source, idx) => (
                          <a
                            key={`source-${idx}`}
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-[var(--gray-light)] bg-[var(--accent-peach)] px-3 py-1 text-[11px] font-semibold text-[var(--primary-orange)] transition hover:bg-[var(--primary-orange)] hover:text-white"
                          >
                            {source.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <form onSubmit={handleSend} className="border-t border-[var(--gray-light)] px-5 py-4">
              <p className="mb-3 text-xs uppercase tracking-[0.5em] text-[var(--gray-medium)]">Ask Compound Beta</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a fighter name or ask Compound Beta a question"
                  className="flex-1 rounded-lg border border-[var(--gray-light)] px-4 py-3 text-sm focus:border-[var(--primary-orange)] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSearching || (isAnalyzing && !selectedFighter)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary-orange)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-orange-dark)] disabled:opacity-60"
                >
                  <Search className="h-4 w-4" />
                  Send
                </button>
              </div>
              <p className="mt-2 text-[11px] text-[var(--gray-medium)]">
                Add a question mark or "how/what/why" to shift Compound Beta into analysis mode after a fighter is selected.
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
