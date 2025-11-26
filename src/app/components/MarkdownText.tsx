'use client';

import React from 'react';

interface MarkdownTextProps {
  content: string;
}

export default function MarkdownText({ content }: MarkdownTextProps) {
  const renderContent = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let listType: 'numbered' | 'bullet' | null = null;

    const flushList = () => {
      if (currentList.length > 0) {
        if (listType === 'numbered') {
          elements.push(
            <ol key={`list-${elements.length}`} className="my-3 ml-4 list-decimal space-y-1.5 text-[var(--neutral-600)]">
              {currentList.map((item, i) => (
                <li key={i} className="text-[15px] leading-relaxed pl-1">
                  {renderInlineMarkdown(item)}
                </li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`list-${elements.length}`} className="my-3 ml-4 list-disc space-y-1.5 text-[var(--neutral-600)]">
              {currentList.map((item, i) => (
                <li key={i} className="text-[15px] leading-relaxed pl-1">
                  {renderInlineMarkdown(item)}
                </li>
              ))}
            </ul>
          );
        }
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/);
      if (numberedMatch) {
        if (listType !== 'numbered') {
          flushList();
          listType = 'numbered';
        }
        currentList.push(numberedMatch[2]);
        return;
      }

      const bulletMatch = trimmedLine.match(/^[-•]\s+(.+)/);
      if (bulletMatch) {
        if (listType !== 'bullet') {
          flushList();
          listType = 'bullet';
        }
        currentList.push(bulletMatch[1]);
        return;
      }

      flushList();

      if (!trimmedLine) {
        if (elements.length > 0) {
          elements.push(<div key={`space-${index}`} className="h-2" />);
        }
        return;
      }

      elements.push(
        <p key={`p-${index}`} className="text-[15px] leading-relaxed text-[var(--neutral-600)]">
          {renderInlineMarkdown(trimmedLine)}
        </p>
      );
    });

    flushList();

    return elements;
  };

  return <div className="space-y-1">{renderContent()}</div>;
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(remaining.substring(0, boldMatch.index));
      }
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="font-semibold text-[var(--foreground)]">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
