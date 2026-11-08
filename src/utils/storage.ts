import { Achievement, DailyMission, ThemeId } from '../types/game';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    title: 'First Reflex',
    description: 'Score your first 100 points',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'sharpshooter',
    title: 'Deadeye Accuracy',
    description: 'Achieve 90%+ accuracy in a 30s round',
    icon: '🎯',
    unlocked: false,
    progress: 0,
    maxProgress: 90,
  },
  {
    id: 'combo_master',
    title: 'Combo God',
    description: 'Reach a x10 combo streak',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'gold_rush',
    title: 'Midas Touch',
    description: 'Hit 8 Golden targets across your runs',
    icon: '🟡',
    unlocked: false,
    progress: 0,
    maxProgress: 8,
  },
  {
    id: 'bomb_dodger',
    title: 'Bomb Defuser',
    description: 'Score over 300 points without clicking a single bomb',
    icon: '💣',
    unlocked: false,
    progress: 0,
    maxProgress: 300,
  },
  {
    id: 'score_500',
    title: 'Apex Reflex',
    description: 'Break the 500 points milestone',
    icon: '👑',
    unlocked: false,
    progress: 0,
    maxProgress: 500,
  },
  {
    id: 'streak_3',
    title: 'Daily Warrior',
    description: 'Maintain a 3-day playing streak',
    icon: '📅',
    unlocked: false,
    progress: 1,
    maxProgress: 3,
  },
];

export const Storage = {
  getHighScore(): number {
    return parseInt(localStorage.getItem('dont_blink_high_score') || '0', 10);
  },

  setHighScore(score: number): boolean {
    const current = this.getHighScore();
    if (score > current) {
      localStorage.setItem('dont_blink_high_score', String(score));
      return true; // New record!
    }
    return false;
  },

  getPlayerName(): string {
    let name = localStorage.getItem('dont_blink_player_name');
    if (!name) {
      const suffixes = ['Viper', 'Phantom', 'Reflex', 'Glitch', 'Blitz', 'Apex', 'Cyber', 'Striker'];
      const randSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      const randNum = Math.floor(100 + Math.random() * 900);
      name = `${randSuffix}_${randNum}`;
      localStorage.setItem('dont_blink_player_name', name);
    }
    return name;
  },

  setPlayerName(name: string) {
    localStorage.setItem('dont_blink_player_name', name.trim().slice(0, 16));
  },

  // Daily Streak
  getDailyStreak(): { count: number; claimedToday: boolean } {
    const streakCount = parseInt(localStorage.getItem('dont_blink_streak_count') || '1', 10);
    const lastDate = localStorage.getItem('dont_blink_last_date');
    const today = new Date().toISOString().slice(0, 10);

    if (!lastDate) {
      localStorage.setItem('dont_blink_last_date', today);
      localStorage.setItem('dont_blink_streak_count', '1');
      return { count: 1, claimedToday: false };
    }

    if (lastDate === today) {
      const claimed = localStorage.getItem('dont_blink_streak_claimed') === today;
      return { count: streakCount, claimedToday: claimed };
    }

    // Check if consecutive day
    const last = new Date(lastDate);
    const current = new Date(today);
    const diffDays = Math.round((current.getTime() - last.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      const newStreak = streakCount + 1;
      localStorage.setItem('dont_blink_streak_count', String(newStreak));
      localStorage.setItem('dont_blink_last_date', today);
      localStorage.removeItem('dont_blink_streak_claimed');
      return { count: newStreak, claimedToday: false };
    } else {
      // Streak broken, reset to 1
      localStorage.setItem('dont_blink_streak_count', '1');
      localStorage.setItem('dont_blink_last_date', today);
      localStorage.removeItem('dont_blink_streak_claimed');
      return { count: 1, claimedToday: false };
    }
  },

  claimDailyStreak(): boolean {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('dont_blink_streak_claimed', today);
    return true;
  },

  // Themes
  getSelectedTheme(): ThemeId {
    return (localStorage.getItem('dont_blink_theme') as ThemeId) || 'cyber';
  },

  setSelectedTheme(theme: ThemeId) {
    localStorage.setItem('dont_blink_theme', theme);
  },

  getUnlockedThemes(): ThemeId[] {
    const saved = localStorage.getItem('dont_blink_unlocked_themes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return ['cyber', 'synthwave'];
  },

  unlockTheme(theme: ThemeId) {
    const current = this.getUnlockedThemes();
    if (!current.includes(theme)) {
      current.push(theme);
      localStorage.setItem('dont_blink_unlocked_themes', JSON.stringify(current));
    }
  },

  // Achievements
  getAchievements(): Achievement[] {
    const saved = localStorage.getItem('dont_blink_achievements');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_ACHIEVEMENTS;
  },

  saveAchievements(list: Achievement[]) {
    localStorage.setItem('dont_blink_achievements', JSON.stringify(list));
  },

  // Daily Missions
  getDailyMissions(): DailyMission[] {
    const today = new Date().toISOString().slice(0, 10);
    const savedDate = localStorage.getItem('dont_blink_missions_date');
    const savedMissions = localStorage.getItem('dont_blink_missions');

    if (savedDate === today && savedMissions) {
      try {
        return JSON.parse(savedMissions);
      } catch {
        // regenerate
      }
    }

    // Generate new missions for today
    const missions: DailyMission[] = [
      {
        id: 'play_3',
        title: 'Warmup Reflexes',
        description: 'Play 3 rounds of DON\'T BLINK',
        progress: 0,
        target: 3,
        completed: false,
        reward: '+50 XP & Theme Booster',
      },
      {
        id: 'hit_gold_5',
        title: 'Gold Prospector',
        description: 'Hit 5 Golden targets',
        progress: 0,
        target: 5,
        completed: false,
        reward: 'Gold Badge & Glow FX',
      },
      {
        id: 'score_300',
        title: 'Speed Demon',
        description: 'Score 300+ in a single round',
        progress: 0,
        target: 300,
        completed: false,
        reward: 'VIP Theme Unlock',
      },
    ];

    localStorage.setItem('dont_blink_missions_date', today);
    localStorage.setItem('dont_blink_missions', JSON.stringify(missions));
    return missions;
  },

  saveDailyMissions(missions: DailyMission[]) {
    localStorage.setItem('dont_blink_missions', JSON.stringify(missions));
  },
};
