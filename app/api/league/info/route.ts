import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";

// GET /api/league/info?league_id=xxx
// Public — returns league name, custom rules, anti_algo, predictions_locked
export async function GET(req: NextRequest) {
  const leagueId = req.nextUrl.searchParams.get("league_id");
  if (!leagueId) return NextResponse.json({ error: "Missing league_id" }, { status: 400 });

  const { data, error } = await supabaseService
    .from("leagues")
    .select("id, name, custom_rules, anti_algo, predictions_locked, plan_tier, max_members")
    .eq("id", leagueId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "League not found" }, { status: 404 });

  return NextResponse.json({ league: data });
}
