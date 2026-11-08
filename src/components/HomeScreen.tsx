import React, { useState } from 'react';
import { FriendChallenge, ThemeId } from '../types/game';
import { Storage } from '../utils/storage';
import { sounds } from '../utils/sound';
import { ChallengeBanner } from './ChallengeBanner';

interface Props {
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
  onOpenAchievements: () => void;
  onOpenThemeSelector: () => void;
  currentTheme: ThemeId;
  challenge: FriendChallenge | null;
}

export const HomeScreen: React.FC<Props> = ({
  onStartGame,
  onOpenLeaderboard,
  onOpenAchievements,
  onOpenThemeSelector,
  challenge,
}) => {
  const [playerName, setPlayerName] = useState(Storage.getPlayerName());
  const [isEditingName, setIsEditingName] = useState(false);
  const [muted, setMuted] = useState(sounds.getMuted());
  const highScore = Storage.getHighScore();
  const streak = Storage.getDailyStreak();

  const handleNameSave = () => {
    Storage.setPlayerName(playerName);
    setIsEditingName(false);
    sounds.playClick();
  };

  const toggleSound = () => {
    const isNowMuted = sounds.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <div className="relative w-full max-w-md mx-auto min-h-screen flex flex-col justify-between p-5 text-center select-none z-10">
      {/* Top Bar: Profile & Utility Controls */}
      <div className="flex items-center justify-between pt-2">
        {/* Player Name / Tag */}
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={14}
                className="px-2 py-1 bg-slate-900 border border-emerald-400 rounded-lg text-xs font-bold text-white focus:outline-none w-28"
                autoFocus
              />
              <button
                onClick={handleNameSave}
                className="px-2 py-1 bg-emerald-500 text-black text-xs font-bold rounded-lg"
              >
                ✓
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700 hover:border-emerald-400/60 transition-all text-xs font-bold text-gray-200"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{playerName}</span>
              <span className="text-[10px] text-gray-400">✎</span>
            </button>
          )}

          {/* Streak pill */}
          <div className="px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1">
            <span>🔥</span>
            <span>{streak.count}d</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-800 hover:border-slate-600 flex items-center justify-center text-sm text-gray-300 hover:text-white transition-all"
          >
            {muted ? '🔇' : '🔊'}
          </button>

          {/* Theme selector */}
          <button
            onClick={() => { sounds.playClick(); onOpenThemeSelector(); }}
            aria-label="Select Theme"
            className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-800 hover:border-slate-600 flex items-center justify-center text-sm text-gray-300 hover:text-white transition-all"
          >
            🎨
          </button>

          {/* Achievements */}
          <button
            onClick={() => { sounds.playClick(); onOpenAchievements(); }}
            aria-label="View Achievements"
            className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-800 hover:border-slate-600 flex items-center justify-center text-sm text-gray-300 hover:text-white transition-all"
          >
            ⭐
          </button>
        </div>
      </div>

      {/* Challenger banner if came from friend link */}
      {challenge && <ChallengeBanner challenge={challenge} />}

      {/* Hero Section: Animated Logo & Eye */}
      <div className="my-auto py-4">
        {/* Glowing Cyber Eye Icon */}
        <div className="relative w-28 h-28 mx-auto mb-3 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/30 via-cyan-500/30 to-purple-600/30 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-full border-2 border-emerald-400/60 bg-slate-950/80 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.3)]">
            <svg
              className="w-16 h-16 text-emerald-400 transition-all duration-300 hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              {/* Outer eye */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
              {/* Pupil crosshair */}
              <circle cx="12" cy="12" r="3.5" fill="currentColor" />
              <circle
                cx="12"
                cy="12"
                r="6"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="2 2"
                className="animate-spin-slow origin-center"
              />
            </svg>
          </div>
        </div>

        {/* Game Title */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono uppercase">
          DON'T <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400">BLINK</span>
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-gray-400 tracking-widest uppercase mt-1">
          30-Second Hyper Reflex Arena
        </p>

        {/* High Score Badge */}
        <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Personal Best:
          </span>
          <span className="text-base font-black font-mono text-emerald-400">
            {highScore} PTS
          </span>
        </div>

        {/* Big PLAY NOW Button */}
        <div className="mt-7">
          <button
            onClick={() => {
              sounds.playClick();
              onStartGame();
            }}
            className="group relative w-full max-w-xs mx-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 font-black text-xl tracking-wider uppercase shadow-[0_0_35px_rgba(0,255,136,0.6)] hover:shadow-[0_0_50px_rgba(0,255,136,0.9)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>PLAY NOW</span>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">⚡</span>
          </button>
          <div className="text-[11px] text-gray-500 font-medium mt-2">
            Instant 30s session • No lag • Free forever
          </div>
        </div>
      </div>

      {/* Bottom Section: 3-Step Instructions & Leaderboard preview */}
      <div className="space-y-3.5 pb-2">
        {/* 3 Simple Visual Steps */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-md">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-1.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/80 flex items-center justify-center text-emerald-400 font-black text-xs mb-1">
              +10
            </div>
            <span className="text-[11px] font-bold text-gray-200">1. Tap Green</span>
            <span className="text-[9px] text-emerald-400 font-medium">+ Gold (+25)</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-1.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/80 flex items-center justify-center text-rose-400 font-black text-xs mb-1">
              -15
            </div>
            <span className="text-[11px] font-bold text-gray-200">2. Avoid Red</span>
            <span className="text-[9px] text-rose-400 font-medium">💣 Bombs Kill</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-1.5">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/80 flex items-center justify-center text-purple-300 font-black text-xs mb-1">
              30s
            </div>
            <span className="text-[11px] font-bold text-gray-200">3. Beat Clock</span>
            <span className="text-[9px] text-purple-400 font-medium">Scale Combo</span>
          </div>
        </div>

        {/* Global Leaderboard Trigger Button */}
        <button
          onClick={() => { sounds.playClick(); onOpenLeaderboard(); }}
          className="w-full py-3 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 text-gray-200 hover:text-white font-bold text-xs flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <span>View Global & Weekly Leaderboard</span>
          </div>
          <span className="text-cyan-400 font-mono text-sm">→</span>
        </button>
      </div>
    </div>
  );
};
