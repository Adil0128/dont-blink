import React, { useEffect, useState, useRef } from 'react';
import { GameStats, FriendChallenge } from '../types/game';
import { Storage } from '../utils/storage';
import { LeaderboardService } from '../services/supabase';
import { generateScoreCard } from '../utils/scoreCard';
import { sounds } from '../utils/sound';
import { particleEngine } from '../utils/particles';

interface Props {
  stats: GameStats;
  challenge: FriendChallenge | null;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onOpenLeaderboard: () => void;
}

export const ResultScreen: React.FC<Props> = ({
  stats,
  challenge,
  onPlayAgain,
  onGoHome,
  onOpenLeaderboard,
}) => {
  const [playerName] = useState(Storage.getPlayerName());
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(true);
  const [cardGenerating, setCardGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeUrl, setChallengeUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine Rank Title & Playful Message
  let rankTitle = '👀 SLOW BLINKER';
  let playfulMsg = 'Did your screen freeze, or did you blink too long?';

  if (stats.reason === 'bomb_detonated') {
    rankTitle = '💥 BOOM! DETONATED';
    playfulMsg = 'Rule #1: NEVER touch the ticking bomb! 💣';
  } else if (stats.score >= 500) {
    rankTitle = '⚡ CYBER GOD (TOP 0.01%)';
    playfulMsg = 'Insane reflexes! Your fingers are moving at the speed of light!';
  } else if (stats.score >= 380) {
    rankTitle = '🥷 CYBER NINJA';
    playfulMsg = 'Godlike precision! Friends won’t believe this score.';
  } else if (stats.score >= 260) {
    rankTitle = '🎯 SHARPSHOOTER';
    playfulMsg = 'Razor-sharp focus. Just a hair away from Cyber Ninja!';
  } else if (stats.score >= 140) {
    rankTitle = '⚡ FAST APPRENTICE';
    playfulMsg = 'Good effort! Warm up those thumbs and go again.';
  }

  // Trigger confetti and record saving
  useEffect(() => {
    if (canvasRef.current) {
      particleEngine.init(canvasRef.current);
      if (stats.score >= 200 && stats.reason !== 'bomb_detonated') {
        particleEngine.triggerConfetti();
      }
    }

    // Save High Score
    const isNew = Storage.setHighScore(stats.score);
    setIsNewRecord(isNew);

    // Update Missions progress
    const missions = Storage.getDailyMissions();
    missions.forEach((m) => {
      if (m.id === 'play_3') m.progress = Math.min(m.target, m.progress + 1);
      if (m.id === 'hit_gold_5') m.progress = Math.min(m.target, m.progress + stats.goldHits);
      if (m.id === 'score_300' && stats.score >= 300) m.progress = m.target;
      if (m.progress >= m.target) m.completed = true;
    });
    Storage.saveDailyMissions(missions);

    // Update Achievements
    const achievements = Storage.getAchievements();
    achievements.forEach((ach) => {
      if (ach.id === 'first_blood' && stats.score >= 100) ach.unlocked = true;
      if (ach.id === 'sharpshooter' && stats.accuracy >= 90 && stats.totalClicks >= 15) ach.unlocked = true;
      if (ach.id === 'combo_master' && stats.highestCombo >= 10) ach.unlocked = true;
      if (ach.id === 'score_500' && stats.score >= 500) ach.unlocked = true;
      if (ach.id === 'bomb_dodger' && stats.score >= 300 && stats.bombHits === 0) ach.unlocked = true;
    });
    Storage.saveAchievements(achievements);

    // Submit to Supabase / Local Leaderboard
    LeaderboardService.submitScore(stats, playerName)
      .then((res) => {
        if (res.rank) setRank(res.rank);
      })
      .finally(() => {
        setSubmitting(false);
      });

    return () => {
      particleEngine.destroy();
    };
  }, [stats, playerName]);

  // Handle Share Score (Web Share API with fallbacks)
  const handleShare = async () => {
    sounds.playClick();
    const shareText = `⚡ I scored ${stats.score} PTS in DON'T BLINK with a x${stats.highestCombo} combo! Can you beat my reflexes? 👀🔥`;
    const shareUrl = `${window.location.origin}${window.location.pathname}?challenger=${encodeURIComponent(
      playerName
    )}&target=${stats.score}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "DON'T BLINK - Arcade Reflex Challenge",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (e) {
        // user cancelled or share failed, fallback
      }
    }

    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(`${shareText} Play: ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Handle WhatsApp Share
  const handleWhatsApp = () => {
    sounds.playClick();
    const url = `${window.location.origin}${window.location.pathname}?challenger=${encodeURIComponent(
      playerName
    )}&target=${stats.score}`;
    const text = `👀 *DON'T BLINK Challenge!*\n⚡ I just scored *${stats.score} points* with *${stats.accuracy}% accuracy* in 30 seconds!\nThink you can beat me?\n\n🎮 *Play here:* ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Generate and Download Viral Score Card PNG
  const handleDownloadCard = async () => {
    sounds.playClick();
    setCardGenerating(true);
    try {
      const dataUrl = await generateScoreCard(stats, playerName, rankTitle);
      const link = document.createElement('a');
      link.download = `dont-blink-score-${stats.score}pts.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Scorecard generation failed:', e);
    } finally {
      setCardGenerating(false);
    }
  };

  // Challenge a Friend link creator
  const handleCreateChallenge = async () => {
    sounds.playClick();
    const code = await LeaderboardService.createFriendChallenge(playerName, stats.score);
    const link = `${window.location.origin}${window.location.pathname}?challenger=${encodeURIComponent(
      playerName
    )}&target=${stats.score}&vs=${code}`;
    setChallengeUrl(link);
    setShowChallengeModal(true);
  };

  return (
    <div className="relative w-full max-w-md mx-auto min-h-screen flex flex-col justify-between p-5 text-center select-none z-10">
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Top Banner: Record or VS outcome */}
      <div className="relative z-10 pt-2">
        {challenge && (
          <div className="mb-3 p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs text-white">
            {stats.score > challenge.targetScore ? (
              <span className="text-emerald-400 font-black">
                🎉 VICTORY! You defeated {challenge.challengerName}'s score by {stats.score - challenge.targetScore} points!
              </span>
            ) : (
              <span className="text-rose-400 font-bold">
                💀 {challenge.challengerName} still holds the crown ({challenge.targetScore} pts). Try again!
              </span>
            )}
          </div>
        )}

        {isNewRecord && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-black uppercase tracking-wider animate-bounce">
            <span>👑</span>
            <span>NEW PERSONAL RECORD!</span>
          </div>
        )}
      </div>

      {/* Center Card: Score & Stats */}
      <div className="relative z-10 my-auto py-3">
        {/* Rank Title Badge */}
        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/40 text-purple-300 font-black text-xs uppercase tracking-wider mb-2 shadow-lg">
          {rankTitle}
        </div>

        {/* Giant Final Score */}
        <div className="font-mono font-black text-6xl sm:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 drop-shadow-[0_0_20px_rgba(0,255,136,0.6)]">
          {stats.score}
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">
          POINTS SCORED
        </div>

        {/* Playful loss/win message */}
        <p className="text-xs sm:text-sm text-gray-300 max-w-xs mx-auto italic mt-2.5 font-medium">
          "{playfulMsg}"
        </p>

        {/* Rank indicator */}
        {rank && (
          <div className="mt-3 text-xs text-cyan-400 font-semibold">
            Global Standing: <strong className="font-mono text-white text-sm">#{rank}</strong> on Leaderboard
          </div>
        )}

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <div className="text-[10px] text-gray-400 font-bold uppercase">Accuracy</div>
            <div className="font-mono font-black text-lg text-cyan-400">{stats.accuracy}%</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <div className="text-[10px] text-gray-400 font-bold uppercase">Max Combo</div>
            <div className="font-mono font-black text-lg text-purple-400">x{stats.highestCombo}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <div className="text-[10px] text-gray-400 font-bold uppercase">Green Hits</div>
            <div className="font-mono font-black text-lg text-emerald-400">{stats.greenHits}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <div className="text-[10px] text-gray-400 font-bold uppercase">Gold Hits</div>
            <div className="font-mono font-black text-lg text-amber-400">{stats.goldHits}</div>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="relative z-10 space-y-2.5 pb-2">
        {/* Instant Replay Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onPlayAgain();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 font-black text-lg uppercase tracking-wider shadow-[0_0_25px_rgba(0,255,136,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>PLAY AGAIN</span>
          <span className="text-xl">⚡</span>
        </button>

        {/* Viral Action Buttons Row (Challenge + Share + WhatsApp) */}
        <div className="grid grid-cols-3 gap-2">
          {/* Challenge a friend */}
          <button
            onClick={handleCreateChallenge}
            className="py-2.5 px-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md transition-all"
          >
            <span>⚔️</span>
            <span>Challenge</span>
          </button>

          {/* Share score */}
          <button
            onClick={handleShare}
            className="py-2.5 px-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md transition-all"
          >
            <span>📤</span>
            <span>{copied ? 'Copied!' : 'Share Score'}</span>
          </button>

          {/* WhatsApp share */}
          <button
            onClick={handleWhatsApp}
            className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md transition-all"
          >
            <span>💬</span>
            <span>WhatsApp</span>
          </button>
        </div>

        {/* Download Score Card */}
        <button
          onClick={handleDownloadCard}
          disabled={cardGenerating}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-gray-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
        >
          <span>📸</span>
          <span>
            {cardGenerating ? 'Rendering Card...' : 'Download Instagram / TikTok Story Card'}
          </span>
        </button>

        {/* Home & Leaderboard links */}
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            onClick={() => { sounds.playClick(); onGoHome(); }}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Home Menu
          </button>

          <button
            onClick={() => { sounds.playClick(); onOpenLeaderboard(); }}
            className="text-xs text-purple-400 hover:text-purple-300 font-bold transition-colors"
          >
            Leaderboard 🏆
          </button>
        </div>
      </div>

      {/* Challenge Link Modal */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-slate-950 border border-purple-500/40 p-5 text-center shadow-2xl">
            <div className="text-3xl mb-2">⚔️</div>
            <h3 className="text-lg font-black text-white font-mono">CHALLENGE A FRIEND</h3>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Send this link to anyone. When they open it, they will see your score ({stats.score} pts) and have to beat it!
            </p>

            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 break-all select-all text-left mb-4">
              {challengeUrl}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(challengeUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
              >
                {copied ? '✓ Link Copied to Clipboard!' : 'Copy Challenge Link'}
              </button>

              <button
                onClick={() => setShowChallengeModal(false)}
                className="w-full py-2 text-xs text-gray-400 hover:text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
