import { Fighter, Fight, Analysis } from '@/lib/types';
import SearchResults from './SearchResults';
import FighterProfile from './FighterProfile';
import SourcePills from './SourcePills';
import MarkdownText from './MarkdownText';

export type ChatMessage = {
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

interface ChatMessageProps {
  message: ChatMessage;
  onSelectFighter: (fighter: Fighter) => void;
}

export default function ChatMessage({ message, onSelectFighter }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className="space-y-2">
      <span className={`text-[13px] font-medium ${
        isUser ? 'text-[var(--neutral-500)]' : 'text-[var(--primary)]'
      }`}>
        {isUser ? 'You' : 'Mayweather'}
      </span>
      
      <div>
        {isUser ? (
          <p className="text-[15px] leading-relaxed text-[var(--foreground)]">{message.content}</p>
        ) : (
          <MarkdownText content={message.content} />
        )}

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
