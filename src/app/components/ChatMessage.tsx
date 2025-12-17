import { Fighter, Fight, Analysis } from '@/lib/types';
import SearchResults from './SearchResults';
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
  /** Callback when user selects a fighter from search results */
  onSelectFighter: (fighter: Fighter) => void;
}

/**
 * Renders a single chat message (user or assistant).
 * User messages appear as colored bubbles on the right.
 * Assistant messages include rich content like fighter profiles.
 */
export default function ChatMessage({ message, onSelectFighter }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-[var(--primary)] px-4 py-2.5 shadow-md shadow-orange-500/20">
          <p className="text-[14px] leading-relaxed text-white">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)] mb-2 block opacity-80">
        The Bottom Line
      </span>
      
      <div className="rounded-2xl border border-[var(--neutral-200)] bg-white/80 backdrop-blur-sm px-5 py-4 shadow-sm">
        <MarkdownText content={message.content} />

        {message.meta?.searchResults && message.meta.searchResults.length > 0 && (
          <SearchResults fighters={message.meta.searchResults} onSelectFighter={onSelectFighter} />
        )}

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
