import { Fighter, Fight, Analysis } from '@/lib/types';
import FighterProfile from './FighterProfile';
import SourcePills from './SourcePills';
import MarkdownText from './MarkdownText';

/**
 * Chat message data structure.
 * Messages can contain optional metadata like search results, fighter profiles, etc.
 */
export type ChatMessage = {
  /** Unique identifier */
  id: string;
  /** Message sender */
  role: 'user' | 'assistant';
  /** Text content (supports markdown) */
  content: string;
  /** Optional rich content */
  meta?: {
    searchResults?: Fighter[];
    fighter?: Fighter;
    fights?: Fight[];
    insights?: Analysis | null;
    sources?: { label: string; url: string }[];
  };
};

interface ChatMessageProps {
  /** The message to render */
  message: ChatMessage;
}

/**
 * Renders a single chat message (user or assistant).
 * User messages appear as colored bubbles on the right.
 * Assistant messages include rich content like fighter profiles.
 */
export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end px-1">
        <div className="max-w-[78%] rounded-[10px] bg-[var(--groq-orange)] px-4.5 py-3 shadow-lg shadow-[var(--groq-orange)]/25">
          <p className="text-[14px] leading-relaxed text-white">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)] opacity-80">
          Groq Analyst
        </span>
      
      <div className="rounded-[10px] border border-[var(--neutral-200)]/80 bg-white/85 backdrop-blur-sm px-6 py-5 shadow-[0_12px_45px_rgba(0,0,0,0.08)] space-y-4">
        <MarkdownText content={message.content} />

        {message.meta?.fighter && (
          <FighterProfile
            fighter={message.meta.fighter}
            fights={message.meta.fights}
            insights={message.meta.insights}
          />
        )}

        {message.meta?.sources && message.meta.sources.length > 0 && (
          <SourcePills sources={message.meta.sources} />
        )}
      </div>
    </div>
  );
}
