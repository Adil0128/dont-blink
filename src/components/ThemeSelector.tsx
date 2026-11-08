import React from 'react';
import { ThemeId, ThemeConfig } from '../types/game';
import { Storage } from '../utils/storage';
import { sounds } from '../utils/sound';

export const THEMES: ThemeConfig[] = [
  {
    id: 'cyber',
    name: 'Cyber Neon',
    accent: '#00ff88',
    bgDark: 'from-[#080811] via-[#0d0d1e] to-[#050508]',
    glowColor: 'rgba(0, 255, 136, 0.4)',
    targetColors: {
      green: '#00ff88',
      gold: '#ffd700',
      red: '#ff0055',
      bomb: '#dc2626',
    },
  },
  {
    id: 'synthwave',
    name: 'Synthwave 80s',
    accent: '#ec4899',
    bgDark: 'from-[#120726] via-[#1a0b36] to-[#090214]',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    targetColors: {
      green: '#38bdf8',
      gold: '#f43f5e',
      red: '#a855f7',
      bomb: '#ef4444',
    },
  },
  {
    id: 'matrix',
    name: 'Matrix Code',
    accent: '#22c55e',
    bgDark: 'from-[#020b05] via-[#041409] to-[#010602]',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    targetColors: {
      green: '#22c55e',
      gold: '#86efac',
      red: '#ef4444',
      bomb: '#991b1b',
    },
  },
  {
    id: 'crimson',
    name: 'Vampire Dark',
    accent: '#f43f5e',
    bgDark: 'from-[#170509] via-[#22070e] to-[#0a0204]',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    targetColors: {
      green: '#10b981',
      gold: '#fbbf24',
      red: '#e11d48',
      bomb: '#881337',
    },
  },
  {
    id: 'gold',
    name: 'Hyper Gold (VIP)',
    accent: '#fbbf24',
    bgDark: 'from-[#1a1405] via-[#261d08] to-[#0d0a02]',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    targetColors: {
      green: '#4ade80',
      gold: '#f59e0b',
      red: '#f87171',
      bomb: '#b45309',
    },
    isVip: true,
  },
];

interface Props {
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  onClose: () => void;
}

export const ThemeSelector: React.FC<Props> = ({ currentTheme, onSelectTheme, onClose }) => {
  const unlocked = Storage.getUnlockedThemes();

  const handleSelect = (t: ThemeConfig) => {
    sounds.playClick();
    if (t.isVip && !unlocked.includes(t.id)) {
      // unlock demo
      Storage.unlockTheme(t.id);
    }
    onSelectTheme(t.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900/90 border border-slate-700/80 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            🎨 Select Arcade Theme
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-gray-400 hover:text-white flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id;
            const isThemeUnlocked = unlocked.includes(theme.id) || !theme.isVip;

            return (
              <button
                key={theme.id}
                onClick={() => handleSelect(theme)}
                className={`w-full p-3 rounded-xl flex items-center justify-between transition-all border ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full border border-white/30"
                    style={{ backgroundColor: theme.accent }}
                  />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      {theme.name}
                      {theme.isVip && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                          VIP
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isSelected && (
                    <span className="text-emerald-400 text-xs font-bold">ACTIVE</span>
                  )}
                  {!isThemeUnlocked && (
                    <span className="text-xs text-amber-400 font-medium">Click to Unlock</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};
