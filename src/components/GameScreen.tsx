import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Target as TargetType, TargetType as TargetKind, GameStats, FloatingPopup, FriendChallenge } from '../types/game';
import { Target } from './Target';
import { sounds } from '../utils/sound';
import { particleEngine } from '../utils/particles';
import { ChallengeBanner } from './ChallengeBanner';

interface Props {
  onGameOver: (stats: GameStats) => void;
  challenge: FriendChallenge | null;
}

export const GameScreen: React.FC<Props> = ({ onGameOver, challenge }) => {
  // Game states
  const [countdown, setCountdown] = useState<number>(3); // 3-2-1-GO
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [highestCombo, setHighestCombo] = useState<number>(0);
  const [targets, setTargets] = useState<TargetType[]>([]);
  const [popups, setPopups] = useState<FloatingPopup[]>([]);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // Stats tracking
  const statsRef = useRef({
    greenHits: 0,
    goldHits: 0,
    redHits: 0,
    bombHits: 0,
    totalClicks: 0,
    successfulHits: 0,
    startTime: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameClockRef = useRef<NodeJS.Timeout | null>(null);
  const targetIdCounter = useRef<number>(0);

  // Initialize particle canvas
  useEffect(() => {
    if (canvasRef.current) {
      particleEngine.init(canvasRef.current);
    }
    return () => {
      particleEngine.destroy();
    };
  }, []);

  // 1. Initial 3-2-1 Countdown
  useEffect(() => {
    if (countdown > 0) {
      sounds.playCountdownBeep(false);
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 850);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isPlaying) {
      sounds.playCountdownBeep(true);
      setIsPlaying(true);
      statsRef.current.startTime = Date.now();
    }
  }, [countdown, isPlaying]);

  // Trigger floating popup text
  const addPopup = useCallback((text: string, color: string, clientX: number, clientY: number) => {
    const id = 'pop-' + Math.random().toString(36).substring(2, 8);
    // Convert to relative coordinate if inside arena
    let x = clientX;
    let y = clientY;
    if (arenaRef.current) {
      const rect = arenaRef.current.getBoundingClientRect();
      x = clientX - rect.left;
      y = clientY - rect.top;
    }

    setPopups((prev) => [...prev.slice(-8), { id, x, y, text, color, createdAt: Date.now() }]);

    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 800);
  }, []);

  // Finish Game
  const finishGame = useCallback(
    (reason: 'time_up' | 'bomb_detonated') => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (gameClockRef.current) clearInterval(gameClockRef.current);

      const elapsed = Math.round((Date.now() - statsRef.current.startTime) / 1000);
      const totalClicks = Math.max(statsRef.current.totalClicks, statsRef.current.successfulHits);
      const accuracy = totalClicks > 0
        ? Math.round((statsRef.current.successfulHits / totalClicks) * 100)
        : 0;

      const finalStats: GameStats = {
        score,
        accuracy,
        highestCombo,
        currentCombo: combo,
        greenHits: statsRef.current.greenHits,
        goldHits: statsRef.current.goldHits,
        redHits: statsRef.current.redHits,
        bombHits: statsRef.current.bombHits,
        totalClicks,
        successfulHits: statsRef.current.successfulHits,
        timePlayed: elapsed,
        reason,
      };

      if (reason === 'bomb_detonated') {
        sounds.playBombExplosion();
      } else {
        sounds.playGameOver(score >= 250);
      }

      onGameOver(finalStats);
    },
    [score, highestCombo, combo, onGameOver]
  );

  // 2. 30-Second Game Clock
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    gameClockRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 6 && prev > 1) {
          sounds.playUrgentTick();
        }
        if (prev <= 1) {
          clearInterval(gameClockRef.current!);
          finishGame('time_up');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (gameClockRef.current) clearInterval(gameClockRef.current);
    };
  }, [isPlaying, isPaused, finishGame]);

  // 3. Dynamic Target Spawner
  const spawnTarget = useCallback(() => {
    if (!isPlaying || isPaused) return;

    // Weight probabilities:
    // Green: 60%, Gold: 15%, Red: 18%, Bomb: 7%
    const rand = Math.random();
    let type: TargetKind = 'green';
    let points = 10;
    if (rand < 0.60) {
      type = 'green';
      points = 10;
    } else if (rand < 0.75) {
      type = 'gold';
      points = 25;
    } else if (rand < 0.93) {
      type = 'red';
      points = -15;
    } else {
      type = 'bomb';
      points = 0;
    }

    // Dynamic duration based on time left & score
    // Starts at 1600ms, drops to 850ms
    const speedRatio = (30 - timeLeft) / 30; // 0 to 1
    const baseDuration = type === 'gold' ? 1200 : type === 'bomb' ? 2000 : 1600;
    const duration = Math.max(750, baseDuration - speedRatio * 650);

    // Random safe positions (10% to 85% to avoid borders and HUD)
    const x = Math.floor(10 + Math.random() * 75);
    const y = Math.floor(12 + Math.random() * 70);

    const newTarget: TargetType = {
      id: 'target-' + ++targetIdCounter.current,
      x,
      y,
      type,
      points,
      duration,
      createdAt: Date.now(),
      size: type === 'gold' ? 76 : type === 'bomb' ? 80 : 72,
    };

    setTargets((prev) => [...prev, newTarget]);

    // Set expiration timer for this target
    setTimeout(() => {
      setTargets((current) => {
        const target = current.find((t) => t.id === newTarget.id);
        if (target && !target.isHit) {
          // If a green or gold target expires, it counts as a blink / miss! Combo resets.
          if (target.type === 'green' || target.type === 'gold') {
            setCombo(0);
          }
        }
        return current.filter((t) => t.id !== newTarget.id);
      });
    }, duration);
  }, [isPlaying, isPaused, timeLeft]);

  // Spawner interval loop
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    // Interval shrinks as game progresses (from 800ms down to 360ms)
    const speedFactor = (30 - timeLeft) / 30;
    const interval = Math.max(340, 800 - speedFactor * 420);

    spawnTimerRef.current = setInterval(() => {
      spawnTarget();
      // Near end of game or with high score, occasionally spawn a second target!
      if (Math.random() > 0.65 && timeLeft < 20) {
        setTimeout(spawnTarget, 160);
      }
    }, interval);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [isPlaying, isPaused, timeLeft, spawnTarget]);

  // Handle Arena Click (for accuracy tracking on background miss)
  const handleArenaPointerDown = (e: React.PointerEvent) => {
    // Only count if click is not on a target
    if ((e.target as HTMLElement).closest('[data-target]')) return;
    statsRef.current.totalClicks += 1;
  };

  // Handle Target Hit
  const handleTargetHit = (target: TargetType, clientX: number, clientY: number) => {
    statsRef.current.totalClicks += 1;

    // Remove immediately to prevent multi-clicks
    setTargets((prev) => prev.filter((t) => t.id !== target.id));

    // Emit particle burst
    particleEngine.emitTargetBurst(clientX, clientY, target.type);

    if (target.type === 'bomb') {
      // BOMB DETONATED: Instant game over!
      statsRef.current.bombHits += 1;
      setScreenShake(true);
      addPopup('💥 BOOM!', '#ff0033', clientX, clientY);
      finishGame('bomb_detonated');
      return;
    }

    if (target.type === 'red') {
      // RED HIT: Penalty & break combo
      statsRef.current.redHits += 1;
      sounds.playRedHit();
      setScore((s) => Math.max(0, s - 15));
      setCombo(0);
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 250);
      addPopup('-15', '#ff0055', clientX, clientY);
      return;
    }

    // SUCCESSFUL HIT (Green or Gold)
    statsRef.current.successfulHits += 1;

    if (target.type === 'gold') {
      statsRef.current.goldHits += 1;
      sounds.playGoldHit();
      const newCombo = combo + 2;
      setCombo(newCombo);
      setHighestCombo((h) => Math.max(h, newCombo));

      const multiplier = newCombo >= 10 ? 3 : newCombo >= 5 ? 2 : 1;
      const pts = 25 * multiplier;
      setScore((s) => s + pts);

      addPopup(`+${pts} 🟡`, '#ffd700', clientX, clientY);

      if (newCombo % 5 === 0) {
        sounds.playComboFanfare();
        addPopup(`COMBO x${newCombo}!`, '#00f0ff', clientX, clientY - 40);
      }
    } else {
      // Green
      statsRef.current.greenHits += 1;
      sounds.playGreenHit(combo);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setHighestCombo((h) => Math.max(h, newCombo));

      const multiplier = newCombo >= 10 ? 2 : 1;
      const pts = 10 * multiplier;
      setScore((s) => s + pts);

      addPopup(`+${pts}`, '#00ff88', clientX, clientY);

      if (newCombo % 5 === 0) {
        sounds.playComboFanfare();
        addPopup(`COMBO x${newCombo}!`, '#00f0ff', clientX, clientY - 40);
      }
    }
  };

  // Multiplier helper
  const comboMultiplier = combo >= 10 ? 'x3.0' : combo >= 5 ? 'x2.0' : combo >= 3 ? 'x1.5' : 'x1.0';

  return (
    <div
      className={`relative w-full h-screen max-w-lg mx-auto flex flex-col justify-between overflow-hidden select-none ${
        screenShake ? 'animate-shake' : ''
      }`}
    >
      {/* 60fps Particle Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-40"
      />

      {/* Initial 3-2-1 Countdown Overlay */}
      {countdown > 0 && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md">
          <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 font-mono animate-ping">
            {countdown}
          </div>
          <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-6">
            GET READY • DON'T BLINK
          </div>
        </div>
      )}

      {/* Friend VS Banner */}
      {challenge && (
        <ChallengeBanner challenge={challenge} currentScore={score} isPlaying={true} />
      )}

      {/* Top HUD (Heads-Up Display) */}
      <div className="relative z-20 px-4 pt-3 flex items-center justify-between">
        {/* Timer Circle */}
        <div className="flex items-center gap-2">
          <div
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-mono font-black text-lg transition-all ${
              timeLeft <= 5
                ? 'border-rose-500 text-rose-400 bg-rose-500/20 animate-pulse-fast shadow-[0_0_20px_rgba(244,63,94,0.8)]'
                : 'border-emerald-400 text-emerald-300 bg-slate-900/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
          >
            {timeLeft}s
          </div>
        </div>

        {/* Live Score Counter with glow */}
        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            SCORE
          </div>
          <div className="font-mono font-black text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_12px_rgba(0,255,136,0.6)]">
            {score}
          </div>
        </div>

        {/* Combo Multiplier + Pause */}
        <div className="flex items-center gap-2">
          <div
            className={`px-2.5 py-1 rounded-xl border flex flex-col items-center transition-all ${
              combo >= 5
                ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse'
                : 'border-slate-800 bg-slate-900/60'
            }`}
          >
            <span className="text-[9px] text-gray-400 font-bold uppercase">COMBO</span>
            <span
              className={`text-xs font-mono font-black ${
                combo >= 5 ? 'text-amber-300' : 'text-gray-300'
              }`}
            >
              {comboMultiplier} ({combo})
            </span>
          </div>

          <button
            onClick={() => { sounds.playClick(); setIsPaused(true); }}
            className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 flex items-center justify-center text-gray-300 hover:text-white transition-all"
            aria-label="Pause Game"
          >
            ⏸️
          </button>
        </div>
      </div>

      {/* Target Arena (Bounding container) */}
      <div
        ref={arenaRef}
        onPointerDown={handleArenaPointerDown}
        className="relative flex-1 w-full mx-auto my-2 overflow-hidden touch-none"
      >
        {/* Subtle grid background inside arena */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Floating popups (+10, +25, etc.) */}
        {popups.map((p) => (
          <div
            key={p.id}
            style={{ left: `${p.x}px`, top: `${p.y}px` }}
            className="absolute z-40 pointer-events-none font-mono font-black text-xl -translate-x-1/2 -translate-y-1/2 animate-float-fade"
          >
            <span style={{ color: p.color, textShadow: `0 0 10px ${p.color}` }}>
              {p.text}
            </span>
          </div>
        ))}

        {/* Targets */}
        {!isPaused &&
          targets.map((target) => (
            <div key={target.id} data-target="true">
              <Target target={target} onHit={handleTargetHit} />
            </div>
          ))}
      </div>

      {/* Bottom Progress Bar */}
      <div className="w-full px-4 pb-4">
        <div className="w-full bg-slate-900/80 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-1000 linear ${
              timeLeft <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
            }`}
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>
      </div>

      {/* Pause Menu Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xs rounded-2xl bg-slate-950 border border-slate-700 p-6 text-center shadow-2xl">
            <h3 className="text-2xl font-black text-white font-mono mb-1">GAME PAUSED</h3>
            <p className="text-xs text-gray-400 mb-6">Take a breath, then jump back in!</p>

            <div className="space-y-3">
              <button
                onClick={() => { sounds.playClick(); setIsPaused(false); }}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition-all"
              >
                Resume
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  finishGame('time_up');
                }}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-400 font-bold text-sm transition-all"
              >
                End Round
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
