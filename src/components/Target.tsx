import React, { useEffect, useState, useRef } from 'react';
import { Target as TargetType } from '../types/game';

interface TargetProps {
  target: TargetType;
  onHit: (target: TargetType, clientX: number, clientY: number) => void;
}

export const Target: React.FC<TargetProps> = ({ target, onHit }) => {
  const [clicked, setClicked] = useState(false);
  const [progress, setProgress] = useState(1);
  const startTimeRef = useRef(Date.now());
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now();

    const updateRing = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 1 - elapsed / target.duration);
      setProgress(remaining);

      if (remaining > 0 && !clicked) {
        animFrameRef.current = requestAnimationFrame(updateRing);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateRing);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [target.duration, clicked]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Prevent default touch gestures (zoom, double-tap delay)
    e.preventDefault();
    e.stopPropagation();

    // Prevent multiple clicks
    if (clicked || target.isHit) return;
    setClicked(true);

    if (navigator.vibrate) {
      if (target.type === 'bomb') navigator.vibrate([100, 50, 150]);
      else if (target.type === 'red') navigator.vibrate(60);
      else navigator.vibrate(20);
    }

    onHit(target, e.clientX, e.clientY);
  };

  // Color configurations
  const config = {
    green: {
      border: 'border-emerald-400',
      bg: 'bg-emerald-500/20',
      shadow: 'shadow-[0_0_25px_rgba(16,185,129,0.7)]',
      ringColor: '#10b981',
      icon: (
        <svg className="w-8 h-8 text-emerald-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="9" strokeWidth="2.5" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <path strokeLinecap="round" strokeWidth="2.5" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
        </svg>
      ),
      badge: '+10',
    },
    gold: {
      border: 'border-yellow-400',
      bg: 'bg-yellow-400/25',
      shadow: 'shadow-[0_0_35px_rgba(250,204,21,0.9)]',
      ringColor: '#facc15',
      icon: (
        <svg className="w-9 h-9 text-yellow-300 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      badge: '+25',
    },
    red: {
      border: 'border-rose-500',
      bg: 'bg-rose-500/20',
      shadow: 'shadow-[0_0_25px_rgba(244,63,94,0.7)]',
      ringColor: '#f43f5e',
      icon: (
        <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      badge: '-15',
    },
    bomb: {
      border: 'border-red-600',
      bg: 'bg-red-950/70',
      shadow: 'shadow-[0_0_40px_rgba(220,38,38,1)]',
      ringColor: '#dc2626',
      icon: (
        <span className="text-3xl select-none animate-bounce">💣</span>
      ),
      badge: 'KILL',
    },
  }[target.type];

  // SVG circular perimeter
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        left: `${target.x}%`,
        top: `${target.y}%`,
        transform: 'translate(-50%, -50%)',
        touchAction: 'none',
      }}
      className={`absolute z-30 cursor-pointer select-none transition-transform duration-75 active:scale-90 ${
        clicked ? 'opacity-0 scale-125 pointer-events-none' : 'scale-100'
      }`}
    >
      {/* Target Container */}
      <div
        className={`relative flex items-center justify-center rounded-full backdrop-blur-md border-2 ${config.border} ${config.bg} ${config.shadow} transition-all`}
        style={{
          width: `${target.size}px`,
          height: `${target.size}px`,
        }}
      >
        {/* Shrinking Countdown Progress Ring */}
        <svg
          className="absolute inset-0 -rotate-90 pointer-events-none"
          width={target.size}
          height={target.size}
          viewBox="0 0 80 80"
        >
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="3.5"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke={config.ringColor}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Inner Icon */}
        <div className="flex flex-col items-center justify-center pointer-events-none">
          {config.icon}
          <span
            className={`text-[10px] font-black uppercase tracking-wider ${
              target.type === 'bomb' ? 'text-red-400 font-extrabold' : 'text-white/90'
            }`}
          >
            {config.badge}
          </span>
        </div>
      </div>
    </div>
  );
};
