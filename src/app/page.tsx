'use client';

import { useEffect, useRef, useState } from 'react';
import { Fighter, Fight, Analysis } from '@/lib/types';
import Header from './components/Header';
import ChatMessage, { type ChatMessage as ChatMessageType } from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ThinkingSteps from './components/ThinkingSteps';
import { ChevronDown, ExternalLink } from 'lucide-react';

const FAMOUS_BOXERS = [
  'Muhammad Ali', 'Mike Tyson', 'Floyd Mayweather', 'Manny Pacquiao',
  'Sugar Ray Leonard', 'Oscar De La Hoya', 'Canelo Alvarez', 'Anthony Joshua',
  'Tyson Fury', 'Deontay Wilder', 'Lennox Lewis', 'Evander Holyfield',
  'George Foreman', 'Joe Frazier', 'Larry Holmes', 'Roy Jones Jr',
  'Bernard Hopkins', 'Shane Mosley', 'Julio Cesar Chavez', 'Roberto Duran',
  'Marvin Hagler', 'Thomas Hearns', 'Gennady Golovkin', 'Terence Crawford',
  'Errol Spence Jr', 'Naoya Inoue', 'Oleksandr Usyk', 'Vasyl Lomachenko',
  'Ryan Garcia', 'Shakur Stevenson', 'Tank Davis', 'Jake Paul'
];

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFighter, setSelectedFighter] = useState<Fighter | null>(null);
  const [contextFighter, setContextFighter] = useState<Fighter | null>(null);
  const [recentFights, setRecentFights] = useState<Fight[]>([]);
  const [insights, setInsights] = useState<Analysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Search for any boxer to explore their stats, fight history, and AI-powered analysis.',
    },
  ]);
  const chatAreaRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isCompoundLoading, setIsCompoundLoading] = useState(false);
  const isInitialState =
    chatHistory.length <= 1 && !selectedFighter && !isSearching && !isAnalyzing && !isCompoundLoading;

  // Scroll detection with animation for landing page
  useEffect(() => {
    if (hasEntered) return;

    let accumulatedScroll = 0;
    const threshold = 150;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        accumulatedScroll += e.deltaY;
        const progress = Math.min(accumulatedScroll / threshold, 1);
        setScrollProgress(progress);
        
        if (progress >= 1) {
          setHasEntered(true);
        }
      } else {
        accumulatedScroll = Math.max(0, accumulatedScroll + e.deltaY);
        setScrollProgress(Math.min(accumulatedScroll / threshold, 1));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
        setScrollProgress(1);
        setTimeout(() => setHasEntered(true), 200);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasEntered]);

  // Scroll to bottom as messages stream in
  useEffect(() => {
    const scrollToBottom = () => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    // Small delay to ensure content is rendered
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [chatHistory, isSearching, isAnalyzing, isCompoundLoading]);

  const appendMessage = (message: ChatMessageType) => {
    setChatHistory((prev: ChatMessageType[]) => [...prev, message]);
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
          ? `Found ${fighters.length} match${fighters.length === 1 ? '' : 'es'} for "${searchTerm}".`
          : `No results for "${searchTerm}". Try another name.`,
        meta: { searchResults: fighters },
      });
    } catch (err) {
      setError('Failed to search fighters.');
      appendMessage({
        id: `search-error-${Date.now()}`,
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
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
    setContextFighter(fighter);
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
      setContextFighter(profile);
      setRecentFights(data.fights || []);
      setInsights(data.insights || null);

      appendMessage({
        id: `profile-${fighter.id}-${Date.now()}`,
        role: 'assistant',
        content: `Here's the complete profile for ${profile.name}.`,
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
        content: 'Could not load fighter profile. Try another selection.',
      });
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendCompoundQuestion = async (questionText: string) => {
    const targetFighter = selectedFighter || contextFighter;
    if (!targetFighter) return;
    setIsCompoundLoading(true);
    try {
      const res = await fetch('/api/compound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fighterId: targetFighter.id,
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
        content: data.answer || 'Could not generate an answer.',
        meta: {
          sources: data.sources,
        },
      });
    } catch (err) {
      appendMessage({
        id: `compound-error-${Date.now()}`,
        role: 'assistant',
        content: 'Could not process your question. Try again.',
      });
      console.error(err);
    } finally {
      setIsCompoundLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setInputValue('');

    appendMessage({
      id: `compound-user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    });

    if (selectedFighter || contextFighter) {
      await sendCompoundQuestion(trimmed);
      return;
    }

    // If no fighter context, decide between general Q&A and search
    const lower = trimmed.toLowerCase();
    const isGeneral =
      /^(what|when|who|why|how|where|which|tell me|list|show|give|upcoming|next|schedule|groq|fight|fights)/i.test(
        trimmed,
      ) || lower.includes('groq') || lower.includes('fight');

    if (isGeneral) {
      setIsCompoundLoading(true);
      try {
        const res = await fetch('/api/compound/general', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: trimmed }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'General question failed');

        appendMessage({
          id: `general-res-${Date.now()}`,
          role: 'assistant',
          content: data.answer || 'Could not generate an answer.',
          meta: { sources: data.sources },
        });
      } catch (err) {
        appendMessage({
          id: `general-error-${Date.now()}`,
          role: 'assistant',
          content: 'Could not process your question. Try again.',
        });
        console.error(err);
      } finally {
        setIsCompoundLoading(false);
      }
      return;
    }

    // fallback to search by fighter name
    await performSearch(trimmed);
  };

  const handleNewSearch = () => {
    setSelectedFighter(null);
    setContextFighter(null);
    setRecentFights([]);
    setInsights(null);
    setError('');
    // Clear chat history and start fresh
    setChatHistory([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Search for any boxer to explore their stats, fight history, and AI-powered analysis.',
      },
    ]);
  };

  const handleRandomFighter = async () => {
    if (!hasEntered) {
      setScrollProgress(1);
      setTimeout(() => setHasEntered(true), 200);
    }
    
    const randomName = FAMOUS_BOXERS[Math.floor(Math.random() * FAMOUS_BOXERS.length)];
    
    setTimeout(async () => {
      appendMessage({
        id: `random-user-${Date.now()}`,
        role: 'user',
        content: `Surprise me`,
      });

      appendMessage({
        id: `random-pick-${Date.now()}`,
        role: 'assistant',
        content: `Let's explore **${randomName}**...`,
      });

      await performSearch(randomName);
    }, hasEntered ? 0 : 250);
  };

  const isLoading = isSearching || isAnalyzing || isCompoundLoading;

  // ASCII Boxing Ring art - larger and more detailed
  const asciiRing = `
    ┌────────────────────────────────────────────────┐
    │                                                │
    │   ┌────────────────────────────────────────┐   │
    │   │                                        │   │
    │   │                                        │   │
    │   │                                        │   │
    │   │                                        │   │
    │   │                                        │   │
    │   │                                        │   │
    │   │                                        │   │
    │   │                                        │   │
    │   │                                        │   │
    │   ├────────────────────────────────────────┤   │
    │   ├────────────────────────────────────────┤   │
    │   ├────────────────────────────────────────┤   │
    │   │                                        │   │
    │   └────────────────────────────────────────┘   │
    │                                                │
    └────────────────────────────────────────────────┘
  `;

  // Landing Screen - Split layout with ASCII ring
  if (!hasEntered) {
    return (
      <main className="relative flex min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
        {/* Subtle texture background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[var(--background)]" />
          {/* Dot grid texture */}
          <div 
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, var(--neutral-300) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Subtle red accent glow */}
          <div 
            className="absolute right-0 top-0 h-[600px] w-[600px] opacity-[0.04]"
            style={{
              background: 'radial-gradient(circle at 70% 30%, var(--ring-red), transparent 60%)',
            }}
          />
        </div>

        {/* Try Groq pill */}
        <div className="absolute right-6 top-6 z-10">
          <a
            href="https://console.groq.com/playground"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-[var(--neutral-200)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--neutral-600)] transition-all hover:border-[var(--neutral-300)] hover:bg-[var(--neutral-50)]"
          >
            Try Groq
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Split screen container */}
        <div 
          className="relative z-10 flex w-full flex-col lg:flex-row transition-all duration-300 ease-out"
          style={{
            transform: `translateY(-${scrollProgress * 40}px)`,
            opacity: 1 - scrollProgress * 0.5,
          }}
        >
          {/* Left side - Text content */}
          <div className="flex flex-1 flex-col justify-center px-8 py-16 md:px-16 lg:px-20 lg:py-0">
            {/* The Ring logo */}
            <div 
              className="animate-fade-in-up mb-8"
              style={{ animationDelay: '0s', opacity: 0 }}
            >
              <img 
                src="/The_Ring_Logo.png" 
                alt="The Ring" 
                className="h-12 w-auto"
              />
            </div>

            {/* Headline - Gothic font */}
            <h1
              className="animate-fade-in-up text-[48px] leading-[1] tracking-tight text-[var(--foreground)] md:text-[64px] lg:text-[80px]"
              style={{ 
                fontFamily: 'var(--font-gothic), serif',
                animationDelay: '0.05s', 
                opacity: 0 
              }}
            >
              Boxing<br />Intelligence
            </h1>

            {/* Subtitle */}
            <p
              className="animate-fade-in-up mt-6 max-w-md text-[16px] leading-relaxed text-[var(--neutral-500)] md:text-[17px]"
              style={{ animationDelay: '0.1s', opacity: 0 }}
            >
              Scout fighters, preview matchups, and get instant AI-powered analysis on any boxer in history.
            </p>

            {/* Partnership line */}
            <div
              className="animate-fade-in-up mt-8 flex items-center gap-3 text-[13px] text-[var(--neutral-500)]"
              style={{ animationDelay: '0.15s', opacity: 0 }}
            >
              <span>Powered by</span>
              <span className="font-semibold text-[var(--foreground)]">Groq</span>
            </div>

            {/* Scroll indicator */}
            <div
              className="animate-fade-in-up mt-16 flex items-center gap-3"
              style={{ animationDelay: '0.2s', opacity: 0 }}
            >
              <div className="flex h-10 w-6 items-start justify-center rounded-full border border-[var(--neutral-300)] p-1.5">
                <div 
                  className="h-2 w-1 rounded-full bg-[var(--ring-red)] animate-bounce-slow"
                />
              </div>
              <span className="text-[12px] font-medium uppercase tracking-widest text-[var(--neutral-400)]">
                Scroll to enter
              </span>
            </div>
          </div>

          {/* Right side - ASCII Ring */}
          <div className="hidden md:flex flex-1 items-center justify-center px-8 lg:px-16">
            <div 
              className="animate-fade-in-up relative"
              style={{ animationDelay: '0.15s', opacity: 0 }}
            >
              {/* ASCII Ring */}
              <pre 
                className="text-[11px] md:text-[13px] lg:text-[15px] leading-[1.5] text-[var(--neutral-300)] select-none whitespace-pre"
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace' }}
              >
                {asciiRing}
              </pre>
              {/* Red accent on ropes - positioned over the horizontal lines */}
              <div className="absolute inset-x-[20%] top-[58%] h-[2px] bg-[var(--ring-red)]/50 blur-[0.5px]" />
              <div className="absolute inset-x-[20%] top-[62%] h-[2px] bg-[var(--ring-red)]/35 blur-[0.5px]" />
              <div className="absolute inset-x-[20%] top-[66%] h-[2px] bg-[var(--ring-red)]/20 blur-[0.5px]" />
              {/* Corner posts */}
              <div className="absolute left-[18%] top-[25%] bottom-[20%] w-[3px] bg-[var(--ring-red)]/30 rounded-full" />
              <div className="absolute right-[18%] top-[25%] bottom-[20%] w-[3px] bg-[var(--ring-red)]/30 rounded-full" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--neutral-200)]">
          <div
            className="h-full bg-[var(--ring-red)] transition-all duration-100"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      </main>
    );
  }

  // Chat Interface
  return (
    <main className="flex h-screen flex-col bg-[var(--background)] animate-fade-in relative">
      {/* Textured background */}
      <div className="app-bg" />
      <div className="app-grid" />
      <div className="app-ropes" />
      
      <Header error={error} />
      
      <div className="flex min-h-0 flex-1 flex-col relative z-[1]">
        {/* Chat area */}
        <div ref={chatAreaRef} className="chat-scroll flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4">
            {chatHistory.map((message, index) => (
              <div 
                key={message.id} 
                className="animate-slide-in"
                style={{ animationDelay: `${Math.min(index * 30, 150)}ms`, opacity: 0 }}
              >
                <ChatMessage message={message} onSelectFighter={handleSelectFighter} />
                      </div>
                    ))}
            {isLoading && (
              <div className="animate-fade-in">
                <ThinkingSteps
                  isSearching={isSearching}
                  isAnalyzing={isAnalyzing}
                  isThinking={isCompoundLoading}
                  fighterName={selectedFighter?.name}
                />
                  </div>
                )}
            <div ref={bottomRef} />
          </div>
        </div>

        <ChatInput
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSubmit={handleSend}
          disabled={isLoading}
          selectedFighter={selectedFighter}
          contextFighter={contextFighter}
          onNewSearch={handleNewSearch}
          onRandomFighter={handleRandomFighter}
          isInitialState={isInitialState}
        />
        </div>
      </main>
  );
}
