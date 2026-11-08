import React, { useState } from 'react';
import { Storage } from '../utils/storage';
import { sounds } from '../utils/sound';

interface Props {
  onClose: () => void;
  onThemeUnlocked: () => void;
}

export const MonetizationModal: React.FC<Props> = ({ onClose, onThemeUnlocked }) => {
  const [adWatching, setAdWatching] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adSuccess, setAdSuccess] = useState(false);
  const [vipPurchased, setVipPurchased] = useState(
    localStorage.getItem('dont_blink_vip') === 'true'
  );

  const startRewardedAd = () => {
    sounds.playClick();
    setAdWatching(true);
    setAdCountdown(5);

    const interval = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setAdWatching(false);
          setAdSuccess(true);
          sounds.playGoldHit();
          Storage.unlockTheme('gold');
          onThemeUnlocked();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSimulateVipPurchase = () => {
    sounds.playGoldHit();
    localStorage.setItem('dont_blink_vip', 'true');
    setVipPurchased(true);
    Storage.unlockTheme('gold');
    Storage.unlockTheme('crimson');
    onThemeUnlocked();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-slate-950 border border-amber-500/40 p-6 shadow-2xl text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
            💎 VIP & REWARDS
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-gray-400 hover:text-white flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {adWatching ? (
          <div className="py-8 space-y-3">
            <div className="text-4xl animate-spin">📺</div>
            <div className="text-white font-bold text-base">Rewarded Sponsor Video</div>
            <p className="text-xs text-gray-400">
              Simulating video advertisement playback...
            </p>
            <div className="w-16 h-16 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto mt-4 flex items-center justify-center font-mono font-bold text-amber-400">
              {adCountdown}s
            </div>
          </div>
        ) : adSuccess ? (
          <div className="py-8 space-y-3">
            <div className="text-4xl">🎉</div>
            <div className="text-white font-bold text-base">Reward Unlocked!</div>
            <p className="text-xs text-emerald-400">
              "Hyper Gold" VIP theme has been permanently added to your profile!
            </p>
            <button
              onClick={onClose}
              className="mt-3 px-6 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs"
            >
              Equip Now
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-4 text-left">
            {/* Rewarded Ad Option */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>📺</span>
                  <span>Watch 5s Rewarded Ad</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Unlock Hyper Gold theme for free
                </div>
              </div>
              <button
                onClick={startRewardedAd}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md"
              >
                Watch
              </button>
            </div>

            {/* VIP Pass Option */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/50 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  <span>👑</span>
                  <span>VIP Arcade Lifetime Pass</span>
                </div>
                <div className="text-xs text-gray-300 mt-0.5">
                  Zero ads, all present & future themes unlocked
                </div>
              </div>
              {vipPurchased ? (
                <span className="text-xs text-emerald-400 font-bold">✓ Active</span>
              ) : (
                <button
                  onClick={handleSimulateVipPurchase}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs shadow-lg shadow-amber-500/30"
                >
                  $1.99
                </button>
              )}
            </div>

            <div className="text-[11px] text-gray-500 text-center italic">
              *Gameplay is never interrupted with forced popups. You are always in control.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
