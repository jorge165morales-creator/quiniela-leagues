-- ============================================================
-- Migration: League v2 — owner, plan tiers, anti-algo toggle, custom rules
-- Run this in your Supabase SQL editor (new Supabase project)
-- ============================================================

-- Add user_id to players so we can track who owns what
alter table players add column if not exists user_id uuid references users(id);

-- Add league ownership + plan fields to leagues
alter table leagues
  add column if not exists owner_user_id uuid references users(id),
  add column if not exists plan_tier text not null default 'starter',
  -- starter=10, basic=25, standard=50, premium=100
  add column if not exists max_members int not null default 10,
  add column if not exists anti_algo boolean not null default true,
  add column if not exists custom_rules text,
  add column if not exists stripe_payment_id text;

-- Index for owner lookups
create index if not exists leagues_owner_idx on leagues(owner_user_id);
create index if not exists players_user_id_idx on players(user_id);

-- ============================================================
-- Plan tier helper: max_members per tier
-- starter  = $5  → 10 members
-- basic    = $8  → 25 members
-- standard = $12 → 50 members
-- premium  = $20 → 100 members
-- ============================================================
