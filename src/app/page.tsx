'use client';

import { useEffect, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import LandingPage from './components/LandingPage';
import ChatView from './components/ChatView';

/**
 * Main page component.
 * 
 * Shows a landing page initially, then transitions to the chat interface
 * when the user scrolls or presses a key.
 */
export default function Home() {
  // ─────────────────────────────────────────────────────────────────
  // Landing Page State
  // ─────────────────────────────────────────────────────────────────
  
  /** Whether user has entered the chat (past landing page) */
  const [hasEntered, setHasEntered] = useState(false);
  
  /** Scroll progress for landing page animation (0-1) */
  const [scrollProgress, setScrollProgress] = useState(0);

  // ─────────────────────────────────────────────────────────────────
  // Chat State (from custom hook)
  // ─────────────────────────────────────────────────────────────────
  
  const chat = useChat();

  // ─────────────────────────────────────────────────────────────────
  // Landing Page Scroll/Keyboard Detection
  // ─────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    if (hasEntered) return;

    let accumulatedScroll = 0;
    const threshold = 150;

    /**
     * Track scroll wheel to animate progress bar and trigger entry
     */
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

    /**
     * Allow keyboard shortcuts to enter
     */
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

  // ─────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────
  
  // Show landing page until user enters (via scroll or keyboard)
  if (!hasEntered) {
    return <LandingPage scrollProgress={scrollProgress} />;
  }

  // Main chat interface
  return (
    <ChatView
      // State
      chatHistory={chat.chatHistory}
      inputValue={chat.inputValue}
      selectedFighter={chat.selectedFighter}
      contextFighter={chat.contextFighter}
      isSearching={chat.isSearching}
      isAnalyzing={chat.isAnalyzing}
      isCompoundLoading={chat.isCompoundLoading}
      isLoading={chat.isLoading}
      isInitialState={chat.isInitialState}
      error={chat.error}
      bottomRef={chat.bottomRef}
      
      // Actions
      onInputChange={chat.setInputValue}
      onSubmit={chat.handleSend}
      onSelectFighter={chat.handleSelectFighter}
      onNewSearch={chat.handleNewSearch}
      onRandomFighter={chat.handleRandomFighter}
    />
  );
}
