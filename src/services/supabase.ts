import { createClient } from '@supabase/supabase-js';
import { GameStats, LeaderboardEntry, FriendChallenge } from '../types/game';

// Environment variables or fallback
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http')
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Mock database for instant offline play & zero-friction demo
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'mock-1',
    username: 'NeonGod_99',
    score: 620,
    accuracy: 98,
    maxCombo: 24,
    avatar: '⚡',
    badge: '👑 APEX',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'mock-2',
    username: 'ViperReflex',
    score: 540,
    accuracy: 94,
    maxCombo: 19,
    avatar: '🐍',
    badge: '⚡ GOD',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'mock-3',
    username: 'PhantomSpeed',
    score: 495,
    accuracy: 91,
    maxCombo: 16,
    avatar: '👻',
    badge: '🥷 NINJA',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'mock-4',
    username: 'CyberNinja',
    score: 430,
    accuracy: 89,
    maxCombo: 14,
    avatar: '🗡️',
    badge: '🥷 NINJA',
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: 'mock-5',
    username: 'BlitzTapper',
    score: 385,
    accuracy: 88,
    maxCombo: 12,
    avatar: '💥',
    badge: '🎯 PRO',
    createdAt: new Date(Date.now() - 3600000 * 45).toISOString(),
  },
  {
    id: 'mock-6',
    username: 'TokyoDrifter',
    score: 320,
    accuracy: 85,
    maxCombo: 11,
    avatar: '🏎️',
    badge: '🎯 PRO',
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString(),
  },
  {
    id: 'mock-7',
    username: 'HyperPulse',
    score: 280,
    accuracy: 82,
    maxCombo: 9,
    avatar: '💫',
    badge: '✨ ROOKIE',
    createdAt: new Date(Date.now() - 3600000 * 80).toISOString(),
  },
];

/**
 * Anti-cheat validation to prevent obvious tampering:
 * - 30s game duration constraint
 * - Max realistic points threshold
 * - Click count vs hits plausibility
 */
function validateScorePayload(stats: GameStats): boolean {
  if (stats.score < 0) return false;
  // In 30 seconds, maximum targets spawned is ~60. Even with golden combos, theoretical max is < 900.
  if (stats.score > 950) return false;
  if (stats.accuracy > 100 || stats.accuracy < 0) return false;
  if (stats.successfulHits > stats.totalClicks) return false;
  if (stats.timePlayed < 28 && stats.reason === 'time_up') return false;
  return true;
}

export const LeaderboardService = {
  async fetchLeaderboard(timeframe: 'all' | 'weekly' = 'all'): Promise<LeaderboardEntry[]> {
    if (!isSupabaseConfigured || !supabase) {
      // Simulate real network delay for smooth UX loading states
      await new Promise((r) => setTimeout(r, 200));
      const localCustom = localStorage.getItem('dont_blink_local_scores');
      let combined = [...MOCK_LEADERBOARD];
      if (localCustom) {
        try {
          const parsed = JSON.parse(localCustom);
          combined = [...parsed, ...combined];
        } catch {
          // ignore
        }
      }
      return combined.sort((a, b) => b.score - a.score).slice(0, 50);
    }

    try {
      let query = supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(50);

      if (timeframe === 'weekly') {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', oneWeekAgo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        username: row.username,
        score: row.score,
        accuracy: row.accuracy,
        maxCombo: row.max_combo,
        avatar: row.avatar || '⚡',
        badge: row.badge,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.warn('Supabase fetch failed, fallback to local:', err);
      return MOCK_LEADERBOARD;
    }
  },

  async submitScore(
    stats: GameStats,
    username: string
  ): Promise<{ success: boolean; rank?: number; error?: string }> {
    if (!validateScorePayload(stats)) {
      return { success: false, error: 'Suspicious score rejected by anti-cheat' };
    }

    const avatars = ['⚡', '🔥', '🥷', '💥', '🎯', '✨', '👾', '👑'];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    let rankTitle = '👀 ROOKIE';
    if (stats.score >= 500) rankTitle = '👑 APEX';
    else if (stats.score >= 380) rankTitle = '⚡ GOD';
    else if (stats.score >= 260) rankTitle = '🥷 NINJA';
    else if (stats.score >= 150) rankTitle = '🎯 PRO';

    if (!isSupabaseConfigured || !supabase) {
      const entry: LeaderboardEntry = {
        id: 'local-' + Date.now(),
        username,
        score: stats.score,
        accuracy: stats.accuracy,
        maxCombo: stats.highestCombo,
        avatar: randomAvatar,
        badge: rankTitle,
        isCurrentUser: true,
        createdAt: new Date().toISOString(),
      };

      const localCustom = localStorage.getItem('dont_blink_local_scores');
      let list: LeaderboardEntry[] = localCustom ? JSON.parse(localCustom) : [];
      list.push(entry);
      list.sort((a, b) => b.score - a.score);
      localStorage.setItem('dont_blink_local_scores', JSON.stringify(list.slice(0, 30)));

      // Calculate mock rank
      const all = [...list, ...MOCK_LEADERBOARD].sort((a, b) => b.score - a.score);
      const rank = all.findIndex((e) => e.id === entry.id) + 1;
      return { success: true, rank: rank || 1 };
    }

    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .insert({
          username,
          score: stats.score,
          accuracy: stats.accuracy,
          max_combo: stats.highestCombo,
          avatar: randomAvatar,
          badge: rankTitle,
          green_hits: stats.greenHits,
          gold_hits: stats.goldHits,
          red_hits: stats.redHits,
        })
        .select()
        .single();

      if (error) throw error;

      // Query rank
      const { count } = await supabase
        .from('leaderboard')
        .select('*', { count: 'exact', head: true })
        .gt('score', stats.score);

      return { success: true, rank: (count || 0) + 1 };
    } catch (err: any) {
      console.error('Supabase submit score error:', err);
      return { success: false, error: err.message || 'Submission failed' };
    }
  },

  async createFriendChallenge(challengerName: string, score: number): Promise<string> {
    const challengeCode = 'vs-' + Math.random().toString(36).substring(2, 8);
    const challenge: FriendChallenge = {
      challengerName,
      targetScore: score,
      challengeCode,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('challenges').insert({
          code: challengeCode,
          challenger_name: challengerName,
          target_score: score,
        });
      } catch (e) {
        console.warn('Challenge sync warning:', e);
      }
    }

    // Always store locally too for instant query-param resolution
    localStorage.setItem(`challenge_${challengeCode}`, JSON.stringify(challenge));
    return challengeCode;
  },

  getFriendChallengeFromQuery(): FriendChallenge | null {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const challenger = params.get('challenger');
    const target = params.get('target');
    const code = params.get('vs') || params.get('challenge');

    if (challenger && target) {
      return {
        challengerName: challenger,
        targetScore: parseInt(target, 10) || 200,
        challengeCode: code || 'vs',
      };
    }
    return null;
  },
};
