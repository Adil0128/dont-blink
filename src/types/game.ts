export type TargetType = 'green' | 'gold' | 'red' | 'bomb';

export interface Target {
  id: string;
  x: number; // percentage 5% to 85%
  y: number; // percentage 8% to 82%
  type: TargetType;
  points: number;
  duration: number; // milliseconds before disappearing
  createdAt: number;
  isHit?: boolean;
  size: number; // in pixels (adaptive)
}

export interface FloatingPopup {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  createdAt: number;
}

export type GameStatus = 'idle' | 'countdown' | 'playing' | 'paused' | 'gameover' | 'bomb_gameover';

export interface GameStats {
  score: number;
  accuracy: number;
  highestCombo: number;
  currentCombo: number;
  greenHits: number;
  goldHits: number;
  redHits: number;
  bombHits: number;
  totalClicks: number;
  successfulHits: number;
  timePlayed: number;
  reason: 'time_up' | 'bomb_detonated' | 'completed';
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  accuracy: number;
  maxCombo: number;
  avatar: string;
  badge?: string;
  isCurrentUser?: boolean;
  createdAt: string;
}

export type ThemeId = 'cyber' | 'synthwave' | 'matrix' | 'crimson' | 'gold';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  accent: string;
  bgDark: string;
  glowColor: string;
  targetColors: {
    green: string;
    gold: string;
    red: string;
    bomb: string;
  };
  isVip?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  reward: string;
}

export interface FriendChallenge {
  challengerName: string;
  targetScore: number;
  challengeCode: string;
}
