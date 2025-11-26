'use client';

export default function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1 pl-2">
      <span 
        className="h-1 w-1 rounded-full bg-[var(--primary)]"
        style={{ 
          animation: 'bounce 1.4s ease-in-out infinite',
          animationDelay: '0s'
        }}
      />
      <span 
        className="h-1 w-1 rounded-full bg-[var(--primary)]"
        style={{ 
          animation: 'bounce 1.4s ease-in-out infinite',
          animationDelay: '0.2s'
        }}
      />
      <span 
        className="h-1 w-1 rounded-full bg-[var(--primary)]"
        style={{ 
          animation: 'bounce 1.4s ease-in-out infinite',
          animationDelay: '0.4s'
        }}
      />
    </span>
  );
}
