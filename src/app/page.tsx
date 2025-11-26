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
  const [isCompoundLoading, setIsCompoundLoading] = useState(false);

  // Scroll detection with animation
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

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
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

    if (selectedFighter) {
      await sendCompoundQuestion(trimmed);
    } else {
      await performSearch(trimmed);
    }
  };

  const handleNewSearch = () => {
    setSelectedFighter(null);
    setRecentFights([]);
    setInsights(null);
    setError('');
    appendMessage({
      id: `new-search-${Date.now()}`,
      role: 'assistant',
      content: 'Ready for a new search.',
    });
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

  // Landing Screen with scroll animation
  if (!hasEntered) {
    return (
      <main className="flex min-h-screen flex-col bg-[var(--background)] overflow-hidden">
        {/* Try Groq pill */}
        <div className="absolute right-6 top-6 z-10">
          <a
            href="https://console.groq.com/playground"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-[var(--neutral-200)] bg-[var(--surface)] px-4 py-2 text-[13px] font-medium text-[var(--neutral-600)] transition-all hover:border-[var(--neutral-300)] hover:bg-[var(--surface-muted)]"
          >
            Try Groq
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Landing content with scroll animation */}
        <div 
          className="flex flex-1 flex-col items-center justify-center px-6 transition-all duration-300 ease-out"
          style={{
            transform: `translateY(-${scrollProgress * 30}px) scale(${1 - scrollProgress * 0.05})`,
            opacity: 1 - scrollProgress * 0.5,
          }}
        >
          <div className="flex flex-col items-center text-center">
            {/* Title */}
            <h1 
              className="animate-fade-in-up text-[48px] font-bold leading-tight tracking-tight text-[var(--foreground)] md:text-[64px]"
              style={{ animationDelay: '0s', opacity: 0 }}
            >
              Mayweather
            </h1>
            
            {/* Subtitle */}
            <p 
              className="animate-fade-in-up mt-4 max-w-md text-[17px] leading-relaxed text-[var(--neutral-500)]"
              style={{ animationDelay: '0.1s', opacity: 0 }}
            >
              AI-powered boxing intelligence.<br />
              Powered by Groq.
            </p>

            {/* Scroll indicator */}
            <div 
              className="animate-fade-in-up mt-20 flex flex-col items-center gap-2"
              style={{ animationDelay: '0.3s', opacity: 0 }}
            >
              <span className="text-[12px] font-medium uppercase tracking-widest text-[var(--neutral-400)]">
                Scroll to begin
              </span>
              <ChevronDown 
                className="animate-bounce-slow h-5 w-5 text-[var(--neutral-400)]" 
                style={{ 
                  transform: `translateY(${scrollProgress * 10}px)`,
                  opacity: 1 - scrollProgress 
                }}
              />
            </div>
          </div>
        </div>

        {/* Progress bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--neutral-100)]">
          <div 
            className="h-full bg-[var(--primary)] transition-all duration-100"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      </main>
    );
  }

  // Chat Interface
  return (
    <main className="flex h-screen flex-col bg-[var(--background)] animate-fade-in">
      <Header 
        error={error} 
        selectedFighter={selectedFighter}
        onNewSearch={handleNewSearch}
      />
      
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Chat area */}
        <div ref={chatAreaRef} className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-8">
          <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
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
          </div>
        </div>

        <ChatInput
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSubmit={handleSend}
          disabled={isLoading}
          selectedFighter={selectedFighter}
          onNewSearch={handleNewSearch}
          onRandomFighter={handleRandomFighter}
        />
      </div>
    </main>
  );
}
