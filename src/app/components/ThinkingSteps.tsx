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
        { id: 'search', label: 'Querying AI for boxer matches', status: 'active' },
        { id: 'match', label: 'Selecting best match', status: 'pending' },
      ]);
      setCurrentStepIndex(0);
    } else if (isAnalyzing) {
      setSteps([
        { id: 'fetch', label: `Generating profile for ${fighterName || 'fighter'}`, status: 'active' },
        { id: 'fights', label: 'Compiling fight history', status: 'pending' },
        { id: 'analyze', label: 'Analyzing style & matchups', status: 'pending' },
      ]);
      setCurrentStepIndex(0);
    } else if (isThinking) {
      setSteps([
        { id: 'context', label: 'Reading fighter data', status: 'active' },
        { id: 'research', label: 'Researching boxing records', status: 'pending' },
        { id: 'analyze', label: 'Analyzing matchup dynamics', status: 'pending' },
        { id: 'compose', label: 'Generating answer', status: 'pending' },
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
    <div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)] mb-1 block">
        The Bottom Line
      </span>
      
      <div className="rounded-[10px] border border-[var(--neutral-200)] bg-white px-4 py-3">
        <div className="space-y-1.5">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 transition-all duration-300 ${
                step.status === 'active' 
                  ? 'bg-[var(--primary)]' 
                  : step.status === 'complete'
                  ? 'bg-green-500'
                  : 'bg-[var(--neutral-300)]'
              }`} />
              <span className={`text-[13px] transition-colors ${
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
    </div>
  );
}
