'use client';

import { useEffect, useState } from 'react';
import LoadingDots from './LoadingDots';
import { Search, User, Brain, MessageSquare } from 'lucide-react';

interface ThinkingStepsProps {
  isSearching: boolean;
  isAnalyzing: boolean;
  isThinking: boolean;
  fighterName?: string;
}

type Step = {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'complete';
};

export default function ThinkingSteps({ isSearching, isAnalyzing, isThinking, fighterName }: ThinkingStepsProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isSearching) {
      setSteps([
        { id: 'search', label: 'Searching database', icon: <Search className="h-3.5 w-3.5" />, status: 'active' },
        { id: 'match', label: 'Finding matches', icon: <User className="h-3.5 w-3.5" />, status: 'pending' },
      ]);
      setCurrentStepIndex(0);
    } else if (isAnalyzing) {
      setSteps([
        { id: 'fetch', label: `Loading ${fighterName || 'fighter'}`, icon: <User className="h-3.5 w-3.5" />, status: 'active' },
        { id: 'fights', label: 'Fetching fight history', icon: <Search className="h-3.5 w-3.5" />, status: 'pending' },
        { id: 'analyze', label: 'Generating analysis', icon: <Brain className="h-3.5 w-3.5" />, status: 'pending' },
      ]);
      setCurrentStepIndex(0);
    } else if (isThinking) {
      setSteps([
        { id: 'context', label: 'Reading context', icon: <User className="h-3.5 w-3.5" />, status: 'active' },
        { id: 'search', label: 'Searching sources', icon: <Search className="h-3.5 w-3.5" />, status: 'pending' },
        { id: 'analyze', label: 'Analyzing data', icon: <Brain className="h-3.5 w-3.5" />, status: 'pending' },
        { id: 'compose', label: 'Composing response', icon: <MessageSquare className="h-3.5 w-3.5" />, status: 'pending' },
      ]);
      setCurrentStepIndex(0);
    } else {
      setSteps([]);
      setCurrentStepIndex(0);
    }
  }, [isSearching, isAnalyzing, isThinking, fighterName]);

  useEffect(() => {
    if (steps.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next >= steps.length) {
          return prev;
        }
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [steps.length]);

  useEffect(() => {
    setSteps((prev) =>
      prev.map((step, index) => ({
        ...step,
        status: index < currentStepIndex ? 'complete' : index === currentStepIndex ? 'active' : 'pending',
      }))
    );
  }, [currentStepIndex]);

  if (steps.length === 0) return null;

  return (
    <div className="space-y-2">
      <span className="text-[13px] font-medium text-[var(--primary)]">Mayweather</span>
      
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
              step.status === 'active' 
                ? 'bg-[var(--primary)]/10 text-[var(--primary)]' 
                : step.status === 'complete'
                ? 'bg-green-100 text-green-600'
                : 'bg-[var(--neutral-100)] text-[var(--neutral-400)]'
            }`}>
              {step.status === 'complete' ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.icon
              )}
            </div>
            <span className={`text-[13px] ${
              step.status === 'active'
                ? 'text-[var(--foreground)]'
                : step.status === 'complete'
                ? 'text-[var(--neutral-500)]'
                : 'text-[var(--neutral-400)]'
            }`}>
              {step.label}
              {step.status === 'active' && <LoadingDots />}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
