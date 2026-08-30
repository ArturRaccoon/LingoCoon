'use client';

export default function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((dotIndex) => (
        <span
          key={dotIndex}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400"
          style={{
            animationDelay: `${dotIndex * 0.15}s`,
            animationDuration: '0.8s',
          }}
        />
      ))}
    </div>
  );
}
