'use client';

import { useEffect, useState } from 'react';
import LoadingDots from './LoadingDots';

interface ThinkingStepsProps {
  isSearching: boolean;
  isAnalyzing: boolean;
  isThinking: boolean;
  fighterName?: string;
}

type Step = {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
};

export default function ThinkingSteps({ isSearching, isAnalyzing, isThinking, fighterName }: ThinkingStepsProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isSearching) {
      setSteps([
        { id: 'search', label: 'Searching database', status: 'active' },
        { id: 'match', label: 'Finding matches', status: 'pending' },
      ]);
      setCurrentStepIndex(0);
    } else if (isAnalyzing) {
      setSteps([
        { id: 'fetch', label: `Loading ${fighterName || 'fighter'}`, status: 'active' },
        { id: 'fights', label: 'Fetching fight history', status: 'pending' },
        { id: 'analyze', label: 'Generating analysis', status: 'pending' },
      ]);
      setCurrentStepIndex(0);
    } else if (isThinking) {
      setSteps([
        { id: 'context', label: 'Reading context', status: 'active' },
        { id: 'search', label: 'Searching sources', status: 'pending' },
        { id: 'analyze', label: 'Analyzing data', status: 'pending' },
        { id: 'compose', label: 'Composing response', status: 'pending' },
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
      
      <div className="space-y-1.5">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full transition-colors ${
              step.status === 'active' 
                ? 'bg-[var(--primary)]' 
                : step.status === 'complete'
                ? 'bg-green-500'
                : 'bg-[var(--neutral-300)]'
            }`} />
            <span className={`text-[14px] ${
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
