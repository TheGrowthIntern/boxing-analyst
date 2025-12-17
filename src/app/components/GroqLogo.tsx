'use client';

import Image from 'next/image';

const GROQ_LOGO_SRC = '/groqLogos/Bolt%20+%20Groq%20Orange.svg';

interface GroqLogoProps {
  /** Optional custom class for wrapper */
  className?: string;
  /** Intrinsic width passed to next/image */
  width?: number;
  /** Intrinsic height passed to next/image */
  height?: number;
  /** Optional accessible label (defaults to Groq) */
  label?: string;
}

/**
 * Reusable Groq wordmark so we can drop it anywhere "Groq" is mentioned.
 */
export default function GroqLogo({
  className = '',
  width = 96,
  height = 28,
  label = 'Groq',
}: GroqLogoProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src={GROQ_LOGO_SRC}
        width={width}
        height={height}
        alt={`${label} wordmark`}
        priority
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

