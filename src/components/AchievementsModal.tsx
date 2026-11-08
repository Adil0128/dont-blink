import React from 'react';
import { Storage } from '../utils/storage';
import { sounds } from '../utils/sound';

interface Props {
  onClose: () => void;
}

export const AchievementsModal: React.FC<Props> = ({ onClose }) => {
  const achievements = Storage.getAchievements();
  const missions = Storage.getDailyMissions();
  const streak = Storage.getDailyStreak();

  const handleClaimStreak = () => {
    sounds.playGoldHit();
    Storage.claimDailyStreak();
    // force update
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-950/95 border border-cyan-500/30 p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-yellow-400 flex items-center gap-2">
              ⭐ ACHIEVEMENTS & MISSIONS
            </h3>
            <span className="text-xs text-gray-400">Unlock badges and daily arcade rewards</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-gray-400 hover:text-white flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1 py-3 custom-scrollbar">
          {/* Daily Streak Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl animate-bounce">🔥</div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{streak.count} Day Streak!</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                    +15% XP BOOST
                  </span>
                </div>
                <div className="text-xs text-amber-200/70">
                  Play every day to keep your multiplier alive
                </div>
              </div>
            </div>

            {!streak.claimedToday ? (
              <button
                onClick={handleClaimStreak}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all"
              >
                Claim
              </button>
            ) : (
              <span className="text-xs text-emerald-400 font-bold">✓ Claimed</span>
            )}
          </div>

          {/* Daily Missions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
              <span>📅</span> Today's Missions
            </h4>
            <div className="space-y-2">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex-1 pr-3">
                    <div className="text-sm font-bold text-white">{mission.title}</div>
                    <div className="text-xs text-gray-400">{mission.description}</div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (mission.progress / mission.target) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-gray-300">
                      {mission.progress}/{mission.target}
                    </span>
                    <div className="text-[10px] text-amber-400 font-semibold mt-0.5">
                      {mission.reward}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-1.5">
              <span>🎖️</span> Arcade Badges
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    ach.unlocked
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-slate-800/80 bg-slate-900/40 opacity-70'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${
                      ach.unlocked
                        ? 'bg-emerald-500/20 border border-emerald-400'
                        : 'bg-slate-800 border border-slate-700 grayscale'
                    }`}
                  >
                    {ach.icon}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                      <span>{ach.title}</span>
                      {ach.unlocked && <span className="text-emerald-400">✓</span>}
                    </div>
                    <div className="text-[11px] text-gray-400 line-clamp-1">
                      {ach.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 mt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
