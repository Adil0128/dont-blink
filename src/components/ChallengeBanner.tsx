import React from 'react';
import { FriendChallenge } from '../types/game';

interface Props {
  challenge: FriendChallenge;
  currentScore?: number;
  isPlaying?: boolean;
}

export const ChallengeBanner: React.FC<Props> = ({ challenge, currentScore = 0, isPlaying = false }) => {
  const isBeaten = currentScore > challenge.targetScore;
  const diff = challenge.targetScore - currentScore;

  if (isPlaying) {
    return (
      <div className="w-full bg-gradient-to-r from-purple-900/40 via-cyan-900/40 to-purple-900/40 border-y border-cyan-500/30 px-3 py-1 flex items-center justify-between text-xs backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="animate-pulse">⚔️</span>
          <span className="text-gray-300">VS <strong className="text-cyan-400">{challenge.challengerName}</strong></span>
          <span className="text-gray-400 font-mono">({challenge.targetScore} pts)</span>
        </div>
        <div>
          {isBeaten ? (
            <span className="text-emerald-400 font-bold animate-bounce">
              🔥 BEATEN BY +{currentScore - challenge.targetScore}!
            </span>
          ) : (
            <span className="text-amber-400 font-mono font-semibold">
              Need {diff} pts to win
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto my-3 p-3 rounded-xl bg-gradient-to-r from-purple-900/50 via-slate-900/80 to-purple-900/50 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-purple-600/30 border border-purple-400 flex items-center justify-center text-xl shrink-0 animate-pulse">
        ⚔️
      </div>
      <div className="flex-1 text-left">
        <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
          Direct Challenge Received
        </div>
        <div className="text-sm font-semibold text-white">
          <span className="text-cyan-400 font-bold">{challenge.challengerName}</span> scored{' '}
          <span className="text-emerald-400 font-bold font-mono">{challenge.targetScore} pts</span>!
        </div>
      </div>
      <div className="text-right">
        <span className="inline-block px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/40">
          CAN YOU BEAT IT?
        </span>
      </div>
    </div>
  );
};
