import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";

// GET /api/league/my?user_id=xxx
// Returns the league owned by this user (if any)
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

  const { data, error } = await supabaseService
    .from("leagues")
    .select("id, name, invite_code, predictions_locked, plan_tier, max_members, anti_algo, custom_rules")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ league: data });
}
