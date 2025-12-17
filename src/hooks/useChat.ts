'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Fighter } from '@/lib/types';
import { type ChatMessage } from '@/app/components/ChatMessage';
import { WELCOME_MESSAGE, FAMOUS_BOXERS, GENERAL_QUESTION_PATTERN } from '@/lib/constants';

/**
 * Custom hook that manages all chat state and API interactions.
 * Handles fighter search, analysis, and compound questions.
 */
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
  
  /** Chat message history */
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  
  /** Ref to scroll anchor at bottom of chat */
  const bottomRef = useRef<HTMLDivElement | null>(null);

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

  // ─────────────────────────────────────────────────────────────────
  // API Handlers
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Search for fighters by name
   */
  const performSearch = useCallback(async (searchTerm: string) => {
    setIsSearching(true);
    setError('');
    setSelectedFighter(null);

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
  }, [appendMessage]);

  /**
   * Analyze a specific fighter (fetch profile, fights, insights)
   */
  const handleSelectFighter = useCallback(async (fighter: Fighter) => {
    // Add user message showing selection
    appendMessage({
      id: `user-select-${fighter.id}-${Date.now()}`,
      role: 'user',
      content: fighter.name,
    });

    setSelectedFighter(fighter);
    setContextFighter(fighter);
    setIsAnalyzing(true);
    setError('');

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
  }, [appendMessage]);

  /**
   * Ask a follow-up question about the current fighter context
   */
  const sendCompoundQuestion = useCallback(async (questionText: string) => {
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
    }
  }, [selectedFighter, contextFighter, appendMessage]);

  /**
   * Ask a general question (not about a specific fighter)
   */
  const sendGeneralQuestion = useCallback(async (questionText: string) => {
    setIsCompoundLoading(true);
    
    try {
      const res = await fetch('/api/compound/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionText }),
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
  }, [appendMessage]);

  // ─────────────────────────────────────────────────────────────────
  // User Actions
  // ─────────────────────────────────────────────────────────────────
  
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

  // ─────────────────────────────────────────────────────────────────
  // Return
  // ─────────────────────────────────────────────────────────────────
  
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
    
    // Actions
    handleSend,
    handleSelectFighter,
    handleNewSearch,
    handleRandomFighter,
  };
}

