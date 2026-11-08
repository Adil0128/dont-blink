import React, { useState, useEffect } from 'react';
import { GameStatus, GameStats, ThemeId, FriendChallenge } from './types/game';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import { LeaderboardModal } from './components/LeaderboardModal';
import { AchievementsModal } from './components/AchievementsModal';
import { ThemeSelector, THEMES } from './components/ThemeSelector';
import { MonetizationModal } from './components/MonetizationModal';
import { Storage } from './utils/storage';
import { LeaderboardService } from './services/supabase';

export const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [lastStats, setLastStats] = useState<GameStats | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(Storage.getSelectedTheme());
  const [challenge, setChallenge] = useState<FriendChallenge | null>(null);

  // Modal toggles
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showMonetization, setShowMonetization] = useState(false);

  // Check for challenge params in URL on load
  useEffect(() => {
    const friendChallenge = LeaderboardService.getFriendChallengeFromQuery();
    if (friendChallenge) {
      setChallenge(friendChallenge);
    }
  }, []);

  const handleStartGame = () => {
    setStatus('playing');
  };

  const handleGameOver = (stats: GameStats) => {
    setLastStats(stats);
    setStatus(stats.reason === 'bomb_detonated' ? 'bomb_gameover' : 'gameover');
  };

  const handlePlayAgain = () => {
    setStatus('playing');
  };

  const handleGoHome = () => {
    setStatus('idle');
  };

  const handleSelectTheme = (theme: ThemeId) => {
    setCurrentTheme(theme);
    Storage.setSelectedTheme(theme);
  };

  // Find theme configuration
  const themeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <div
      className={`min-h-screen w-full bg-gradient-to-b ${themeObj.bgDark} text-white flex flex-col items-center justify-center font-sans antialiased overflow-x-hidden transition-colors duration-500`}
    >
      {/* Dynamic Screen Rendering */}
      {status === 'idle' && (
        <HomeScreen
          onStartGame={handleStartGame}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenAchievements={() => setShowAchievements(true)}
          onOpenThemeSelector={() => setShowThemeSelector(true)}
          currentTheme={currentTheme}
          challenge={challenge}
        />
      )}

      {status === 'playing' && (
        <GameScreen onGameOver={handleGameOver} challenge={challenge} />
      )}

      {(status === 'gameover' || status === 'bomb_gameover') && lastStats && (
        <ResultScreen
          stats={lastStats}
          challenge={challenge}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {/* Global Modals */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {showAchievements && (
        <AchievementsModal onClose={() => setShowAchievements(false)} />
      )}

      {showThemeSelector && (
        <ThemeSelector
          currentTheme={currentTheme}
          onSelectTheme={handleSelectTheme}
          onClose={() => setShowThemeSelector(false)}
        />
      )}

      {showMonetization && (
        <MonetizationModal
          onClose={() => setShowMonetization(false)}
          onThemeUnlocked={() => setCurrentTheme(Storage.getSelectedTheme())}
        />
      )}
    </div>
  );
};

export default App;
