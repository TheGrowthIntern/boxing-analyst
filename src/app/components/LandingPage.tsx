'use client';

import { ChevronDown } from 'lucide-react';
import BoxingRingArt from './BoxingRingArt';
import GroqLogo from './GroqLogo';

interface LandingPageProps {
  /** Current scroll progress (0-1) for animation */
  scrollProgress: number;
}

/**
 * Landing page component with split-screen layout.
 * Shows branding, headline, and animated boxing ring illustration.
 * Responds to scroll/keyboard to transition into the chat.
 */
export default function LandingPage({ scrollProgress }: LandingPageProps) {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* Background Layer */}
      <div className="pointer-events-none absolute inset-0">
        {/* Base background */}
        <div className="absolute inset-0 bg-[var(--background)]" />
        
        {/* Dot grid texture */}
        <div 
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--neutral-300) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        
        {/* Subtle accent glow */}
        <div 
          className="absolute right-0 top-0 h-[600px] w-[600px] opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle at 70% 30%, var(--ring-red), transparent 60%)',
          }}
        />
      </div>

      {/* Main Content (Split Layout) */}
      <div 
        className="relative z-10 flex w-full flex-col md:flex-row transition-all duration-300 ease-out"
        style={{
          transform: `translateY(-${scrollProgress * 40}px)`,
          opacity: 1 - scrollProgress * 0.5,
        }}
      >
        {/* Left Side: Text Content */}
        <div className="flex flex-1 flex-col justify-center px-4 py-16 md:px-16 lg:px-20 lg:py-0">
          {/* Logo */}
          <div 
            className="animate-fade-in-up mb-5 md:mb-6 self-start -ml-2 md:-ml-4 lg:-ml-10"
            style={{ animationDelay: '0s', opacity: 0 }}
          >
            <img 
              src="/The_Ring_Logo.png" 
              alt="The Ring" 
              className="h-[100px] md:h-[128px]"
            />
          </div>

          {/* Headline */}
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
            Groq × The Ring delivers instant scouting reports, matchup previews, and tactical breakdowns inspired by the sport’s most trusted voices.
          </p>

          {/* Partnership */}
          <div
            className="animate-fade-in-up mt-8 flex items-center gap-1 text-[16px] text-[var(--neutral-500)]"
            style={{ animationDelay: '0.15s', opacity: 0 }}
          >
            <span>Powered by</span>
            <GroqLogo className="scale-[0.8] -ml-1 inline-block" />
          </div>

          {/* Scroll Indicator */}
          <div
            className="animate-fade-in-up mt-16 flex items-center gap-2"
            style={{ animationDelay: '0.2s', opacity: 0 }}
          >
            <ChevronDown className="h-5 w-5 text-[var(--neutral-400)]" />
            <span className="text-[12px] font-medium uppercase tracking-widest text-[var(--neutral-400)]">
              Scroll to enter
            </span>
          </div>
        </div>

        {/* Right Side: Boxing Ring Art */}
        <div className="flex flex-1 items-center justify-center px-8 lg:px-16">
          <div 
            className="animate-fade-in-up relative w-full max-w-[500px]"
            style={{ animationDelay: '0.15s', opacity: 0 }}
          >
            <BoxingRingArt className="w-full h-auto drop-shadow-xl" />
          </div>
        </div>
      </div>

      {/* Progress Bar*/}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--neutral-200)]">
        <div
          className="h-full bg-[var(--ring-red)] transition-all duration-100"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>
    </main>
  );
}

