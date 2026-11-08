import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../types/game';
import { LeaderboardService, isSupabaseConfigured } from '../services/supabase';
import { sounds } from '../utils/sound';

interface Props {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<Props> = ({ onClose }) => {
  const [tab, setTab] = useState<'all' | 'weekly'>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await LeaderboardService.fetchLeaderboard(tab);
      setEntries(data);
    } catch (err: any) {
      setError('Could not load leaderboard. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-950/95 border border-purple-500/30 p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 flex items-center gap-2">
              🏆 GLOBAL LEADERBOARD
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
              <span className="text-[11px] text-gray-400">
                {isSupabaseConfigured ? 'Connected to Supabase Cloud' : 'Arcade Mode (Global Sync Ready)'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-gray-400 hover:text-white flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 my-3">
          <button
            onClick={() => { sounds.playClick(); setTab('all'); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'all'
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                : 'bg-slate-900 text-gray-400 hover:text-white'
            }`}
          >
            🌟 All-Time Legends
          </button>
          <button
            onClick={() => { sounds.playClick(); setTab('weekly'); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'weekly'
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                : 'bg-slate-900 text-gray-400 hover:text-white'
            }`}
          >
            ⚡ Weekly Rivals
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[300px]">
          {loading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-slate-900/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-rose-400 text-sm">
              <p>{error}</p>
              <button
                onClick={loadData}
                className="mt-3 px-4 py-1.5 rounded-lg bg-slate-800 text-white text-xs hover:bg-slate-700"
              >
                Retry
              </button>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No scores recorded yet. Be the first to claim #1!
            </div>
          ) : (
            entries.map((entry, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              const rankBadges = ['🥇', '🥈', '🥉'];

              return (
                <div
                  key={entry.id || index}
                  className={`p-3 rounded-xl flex items-center justify-between border transition-all ${
                    entry.isCurrentUser
                      ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : isTop3
                      ? 'border-purple-500/40 bg-purple-950/20'
                      : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 text-center font-mono font-black text-sm">
                      {isTop3 ? (
                        <span className="text-lg">{rankBadges[rank - 1]}</span>
                      ) : (
                        <span className="text-gray-500">#{rank}</span>
                      )}
                    </div>

                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0">
                      {entry.avatar}
                    </div>

                    <div className="text-left">
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{entry.username}</span>
                        {entry.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-extrabold border border-purple-500/40">
                            {entry.badge}
                          </span>
                        )}
                        {entry.isCurrentUser && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 flex gap-2">
                        <span>🎯 {entry.accuracy}% acc</span>
                        <span>🔥 x{entry.maxCombo} combo</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-lg text-emerald-400">
                      {entry.score}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase font-semibold">
                      POINTS
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Updated in real-time
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
