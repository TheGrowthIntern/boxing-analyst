'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Fighter, Fight, Analysis } from '@/lib/types';
import { type ChatMessage } from '@/app/components/ChatMessage';
import { WELCOME_MESSAGE, FAMOUS_BOXERS, GENERAL_QUESTION_PATTERN } from '@/lib/constants';

/**
 * Custom hook that manages all chat state and API interactions.
 * Handles fighter search, analysis, and compound questions.
 */

type ProfileCacheEntry = {
  timestamp: number;
  fighter: Fighter;
  fights: Fight[];
  insights: Analysis | null;
};

type AnswerCacheEntry = {
  timestamp: number;
  answer: string;
  sources?: { label: string; url: string }[];
};

const PROFILE_CACHE_TTL = 1000 * 60 * 5;
const ANSWER_CACHE_TTL = 1000 * 60 * 3;

export function useChat() {
  // ─────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────
  
  /** Current input value in the chat box */
  const [inputValue, setInputValue] = useState('');
  
  /** Loading state for fighter search */
  const [isSearching, setIsSearching] = useState(false);
  
  /** Currently selected fighter (active context) */
  const [selectedFighter, setSelectedFighter] = useState<Fighter | null>(null);
  
  /** Fighter context preserved for follow-up questions */
  const [contextFighter, setContextFighter] = useState<Fighter | null>(null);
  
  /** Loading state for fighter analysis */
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  /** Loading state for compound (AI) questions */
  const [isCompoundLoading, setIsCompoundLoading] = useState(false);
  
  /** Error message to display */
  const [error, setError] = useState('');

  /** Status message surfaced in the header */
  const [statusMessage, setStatusMessage] = useState('');
  
  /** Chat message history */
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  
  /** Ref to scroll anchor at bottom of chat */
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /** Cache for fighter profiles */
  const profileCacheRef = useRef<Map<string, ProfileCacheEntry>>(new Map());

  /** Cache for QA answers */
  const answerCacheRef = useRef<Map<string, AnswerCacheEntry>>(new Map());

  // ─────────────────────────────────────────────────────────────────
  // Derived State
  // ─────────────────────────────────────────────────────────────────
  
  /** Combined loading state */
  const isLoading = isSearching || isAnalyzing || isCompoundLoading;
  
  /** Whether we're in the initial (empty) chat state */
  const isInitialState = chatHistory.length <= 1 && !selectedFighter && !isLoading;

  // ─────────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Auto-scroll to bottom when new messages arrive or loading state changes
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    return () => clearTimeout(timer);
  }, [chatHistory, isSearching, isAnalyzing, isCompoundLoading]);

  // ─────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────
  
  /** Append a message to chat history */
  const appendMessage = useCallback((message: ChatMessage) => {
    setChatHistory((prev) => [...prev, message]);
  }, []);

  /** Fetch helper with retries + basic instrumentation */
  const fetchJsonWithRetry = useCallback(
    async (
      input: RequestInfo | URL,
      init: RequestInit = {},
      label: string,
      retries = 2,
    ) => {
      const started = performance.now();
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const response = await fetch(input, init);
          if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `Request failed (${response.status})`);
          }
          const data = await response.json();
          console.log(
            `[metrics] ${label} completed in ${Math.round(performance.now() - started)}ms (attempt ${
              attempt + 1
            })`,
          );
          setStatusMessage('');
          return data;
        } catch (error) {
          if (attempt === retries) {
            throw error;
          }
          setStatusMessage(
            `Retrying ${label.toLowerCase()} (${attempt + 2}/${retries + 1})…`,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 400 * (attempt + 1)),
          );
        }
      }
    },
    [setStatusMessage],
  );

  // ─────────────────────────────────────────────────────────────────
  // API Handlers
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Analyze a specific fighter (fetch profile, fights, insights)
   * Uses Compound Beta to generate comprehensive fighter data
   */
  const handleSelectFighter = useCallback(
    async (fighter: Fighter) => {
      const cacheKey = String(fighter.id ?? fighter.name).toLowerCase();
      const cached = profileCacheRef.current.get(cacheKey);

      setSelectedFighter(fighter);
      setContextFighter(fighter);
      setIsAnalyzing(true);
      setError('');
      setStatusMessage(`Loading ${fighter.name}…`);

      if (
        cached &&
        Date.now() - cached.timestamp < PROFILE_CACHE_TTL
      ) {
        setSelectedFighter(cached.fighter);
        setContextFighter(cached.fighter);
        setIsAnalyzing(false);
        setStatusMessage('');
        appendMessage({
          id: `profile-${fighter.id}-${Date.now()}`,
          role: 'assistant',
          content: `Here's the latest profile for ${cached.fighter.name}.`,
          meta: {
            fighter: cached.fighter,
            fights: cached.fights,
            insights: cached.insights,
          },
        });
        return;
      }

      try {
        const data = await fetchJsonWithRetry(
          '/api/analyze',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fighterId: fighter.id,
              fighterName: fighter.name,
            }),
          },
          'Profile',
          1,
        );

        if (data.error) throw new Error(data.error);

        const profile: Fighter = data.fighter || fighter;
        const fights: Fight[] = data.fights || [];
        const insights: Analysis | null = data.insights || null;

        profileCacheRef.current.set(cacheKey, {
          timestamp: Date.now(),
          fighter: profile,
          fights,
          insights,
        });

        setSelectedFighter(profile);
        setContextFighter(profile);

        appendMessage({
          id: `profile-${fighter.id}-${Date.now()}`,
          role: 'assistant',
          content: `Here's the complete profile for ${profile.name}.`,
          meta: {
            fighter: profile,
            fights,
            insights,
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
        setStatusMessage('');
      }
    },
    [appendMessage, fetchJsonWithRetry],
  );

  /**
   * Search for fighters by name and auto-select the top match
   */
  const performSearch = useCallback(
    async (searchTerm: string) => {
      setIsSearching(true);
      setError('');
      setSelectedFighter(null);
      setStatusMessage(`Searching for “${searchTerm}”…`);

      try {
        const data = await fetchJsonWithRetry(
          `/api/search?q=${encodeURIComponent(searchTerm)}`,
          undefined,
          'Search',
          1,
        );
        
        if (data.error) throw new Error(data.error);
        
        const fighters: Fighter[] = data.fighters || [];

        if (fighters.length === 0) {
          setError(`Couldn't find "${searchTerm}". Try another boxer's name.`);
          appendMessage({
            id: `search-error-${Date.now()}`,
            role: 'assistant',
            content: `I couldn't find a boxer named "${searchTerm}". Try a different name or double-check the spelling.`,
          });
          setStatusMessage('');
          setIsSearching(false);
          return;
        }

        const topMatch = fighters[0];
        await handleSelectFighter(topMatch);
      } catch (err) {
        setError('Failed to search fighters.');
        appendMessage({
          id: `search-error-${Date.now()}`,
          role: 'assistant',
          content: 'Something went wrong while searching. Please try again.',
        });
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    },
    [appendMessage, fetchJsonWithRetry, handleSelectFighter],
  );

  /**
   * Ask a follow-up question about the current fighter context
   * Sends fighter data directly to avoid redundant API lookups
   */
  const sendCompoundQuestion = useCallback(
    async (questionText: string) => {
      const targetFighter = selectedFighter || contextFighter;
      if (!targetFighter) return;
      
      const cacheKey = `${targetFighter.id ?? targetFighter.name}|${questionText.toLowerCase()}`;
      const cached = answerCacheRef.current.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < ANSWER_CACHE_TTL) {
        appendMessage({
          id: `compound-res-${Date.now()}`,
          role: 'assistant',
          content: cached.answer,
          meta: { sources: cached.sources },
        });
        return;
      }

      setIsCompoundLoading(true);
      setStatusMessage('Answering via Compound…');
      
      try {
        // Find the most recent fighter profile message to get fights data
        const profileMessage = [...chatHistory].reverse().find(
          (msg) => msg.meta?.fighter?.id === targetFighter.id,
        );
        const fights = profileMessage?.meta?.fights || [];

        const data = await fetchJsonWithRetry(
          '/api/compound',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fighterId: targetFighter.id,
              fighterName: targetFighter.name,
              fighter: targetFighter,
              fights,
              question: questionText,
            }),
          },
          'Answer',
        );
        
        if (data.error) throw new Error(data.error);

        answerCacheRef.current.set(cacheKey, {
          timestamp: Date.now(),
          answer: data.answer || 'Could not generate an answer.',
          sources: data.sources,
        });

        appendMessage({
          id: `compound-res-${Date.now()}`,
          role: 'assistant',
          content: data.answer || 'Could not generate an answer.',
          meta: { sources: data.sources },
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
        setStatusMessage('');
      }
    },
    [selectedFighter, contextFighter, chatHistory, appendMessage, fetchJsonWithRetry],
  );

  /**
   * Ask a general question (not about a specific fighter)
   */
  const sendGeneralQuestion = useCallback(
    async (questionText: string) => {
      const normalized = questionText.trim().toLowerCase();
      const cacheKey = `general|${normalized}`;
      const cached = answerCacheRef.current.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < ANSWER_CACHE_TTL) {
        appendMessage({
          id: `general-res-${Date.now()}`,
          role: 'assistant',
          content: cached.answer,
          meta: { sources: cached.sources },
        });
        return;
      }

      setIsCompoundLoading(true);
      setStatusMessage('Answering via Compound…');
      
      try {
        const data = await fetchJsonWithRetry(
          '/api/compound/general',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: questionText }),
          },
          'General answer',
        );
        
        if (data.error) throw new Error(data.error);

        answerCacheRef.current.set(cacheKey, {
          timestamp: Date.now(),
          answer: data.answer || 'Could not generate an answer.',
          sources: data.sources,
        });

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
        setStatusMessage('');
      }
    },
    [appendMessage, fetchJsonWithRetry],
  );


  // User Actions
  
  /**
   * Handle form submission - routes to appropriate handler
   */
  const handleSend = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    
    setInputValue('');

    // Add user message
    appendMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    });

    // If we have fighter context, ask about that fighter
    if (selectedFighter || contextFighter) {
      await sendCompoundQuestion(trimmed);
      return;
    }

    // Check if this looks like a general question
    const lower = trimmed.toLowerCase();
    const isGeneral = GENERAL_QUESTION_PATTERN.test(trimmed) || 
                      lower.includes('groq') || 
                      lower.includes('fight');

    if (isGeneral) {
      await sendGeneralQuestion(trimmed);
      return;
    }

    // Default: search for a fighter by name
    await performSearch(trimmed);
  }, [inputValue, selectedFighter, contextFighter, appendMessage, sendCompoundQuestion, sendGeneralQuestion, performSearch]);

  /**
   * Reset chat to initial state
   */
  const handleNewSearch = useCallback(() => {
    setSelectedFighter(null);
    setContextFighter(null);
    setError('');
    setChatHistory([WELCOME_MESSAGE]);
  }, []);

  /**
   * Pick a random famous boxer
   */
  const handleRandomFighter = useCallback(async () => {
    const randomName = FAMOUS_BOXERS[Math.floor(Math.random() * FAMOUS_BOXERS.length)];
    
    appendMessage({
      id: `random-user-${Date.now()}`,
      role: 'user',
      content: 'Surprise me',
    });

    appendMessage({
      id: `random-pick-${Date.now()}`,
      role: 'assistant',
      content: `Let's explore **${randomName}**...`,
    });

    await performSearch(randomName);
  }, [appendMessage, performSearch]);

 
  // Return all the state and actions
  
  return {
    // State
    inputValue,
    setInputValue,
    chatHistory,
    selectedFighter,
    contextFighter,
    isSearching,
    isAnalyzing,
    isCompoundLoading,
    isLoading,
    isInitialState,
    error,
    bottomRef,
    statusMessage,
    
    // Actions
    handleSend,
    handleSelectFighter,
    handleNewSearch,
    handleRandomFighter,
  };
}

