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

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-[var(--primary)] px-4 py-2.5">
          <p className="text-[14px] leading-relaxed text-white">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)] mb-1 block">
        The Bottom Line
      </span>
      
      <div className="rounded-2xl border border-[var(--neutral-200)] bg-white px-4 py-3">
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
