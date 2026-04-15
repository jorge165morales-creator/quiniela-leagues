export type Match = {
  id: string;
  matchday: number;
  round: "group" | "r16" | "qf" | "sf" | "final";
  group?: string; // e.g. "A", "B"
  home_team: string;
  away_team: string;
  kickoff_at: string; // ISO timestamp
  home_score: number | null;
  away_score: number | null;
  status: "upcoming" | "live" | "finished";
};

export type PlanTier = "starter" | "basic" | "standard" | "premium";

export const PLAN_CONFIG: Record<PlanTier, { label: string; price: number; max: number }> = {
  starter:  { label: "Starter",  price: 5,  max: 10  },
  basic:    { label: "Basic",    price: 8,  max: 25  },
  standard: { label: "Standard", price: 12, max: 50  },
  premium:  { label: "Premium",  price: 20, max: 100 },
};

export type League = {
  id: string;
  name: string;
  invite_code: string;
  predictions_locked: boolean;
  created_at: string;
  owner_user_id: string | null;
  plan_tier: PlanTier;
  max_members: number;
  anti_algo: boolean;
  custom_rules: string | null;
  stripe_payment_id: string | null;
};

export type Player = {
  id: string;
  user_id: string | null;
  league_id: string;
  name: string;
  paid: boolean;
  created_at: string;
};

export type Prediction = {
  id: string;
  player_id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  points: number | null;
};

export type LeaderboardEntry = {
  player_id: string;
  player_name: string;
  total_points: number;
  exact_scores: number; // tiebreaker
  correct_results: number;
  predictions_count: number;
};
