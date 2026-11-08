-- DON'T BLINK Supabase Database Schema
-- Run this script in the Supabase SQL Editor to set up your tables, security, and indexes.

-- 1. Create Leaderboard Table
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL CHECK (char_length(username) <= 20),
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1200),
    accuracy NUMERIC(5, 2) NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
    max_combo INTEGER NOT NULL DEFAULT 0,
    avatar TEXT DEFAULT '⚡',
    badge TEXT DEFAULT 'ROOKIE',
    green_hits INTEGER DEFAULT 0,
    gold_hits INTEGER DEFAULT 0,
    red_hits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for instant high-score sorting and weekly filters
CREATE INDEX IF NOT EXISTS idx_leaderboard_score_desc ON public.leaderboard (score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON public.leaderboard (created_at DESC);

-- 2. Create Challenges Table (Friend VS Friend)
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    challenger_name TEXT NOT NULL,
    target_score INTEGER NOT NULL,
    times_played INTEGER DEFAULT 0,
    times_beaten INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for challenge code lookups
CREATE INDEX IF NOT EXISTS idx_challenges_code ON public.challenges (code);

-- 3. Row Level Security (RLS)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the leaderboard
CREATE POLICY "Public leaderboard viewable by everyone" 
ON public.leaderboard FOR SELECT 
USING (true);

-- Allow anyone to insert scores (with anti-cheat check)
CREATE POLICY "Public score submission" 
ON public.leaderboard FOR INSERT 
WITH CHECK (score >= 0 AND score <= 1200);

-- Allow anyone to read and create challenges
CREATE POLICY "Public challenge view" 
ON public.challenges FOR SELECT 
USING (true);

CREATE POLICY "Public challenge insert" 
ON public.challenges FOR INSERT 
WITH CHECK (true);
