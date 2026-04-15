import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";

// PATCH /api/league/update
// Body: { user_id, league_id, anti_algo?, custom_rules?, predictions_locked? }
// Only the owner can update their league.
export async function PATCH(req: NextRequest) {
  try {
    const { user_id, league_id, anti_algo, custom_rules, predictions_locked } = await req.json();
    if (!user_id || !league_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify ownership
    const { data: league, error: fetchErr } = await supabaseService
      .from("leagues")
      .select("id, owner_user_id")
      .eq("id", league_id)
      .maybeSingle();

    if (fetchErr || !league) return NextResponse.json({ error: "League not found" }, { status: 404 });
    if (league.owner_user_id !== user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof anti_algo === "boolean") updates.anti_algo = anti_algo;
    if (typeof custom_rules === "string") updates.custom_rules = custom_rules;
    if (typeof predictions_locked === "boolean") updates.predictions_locked = predictions_locked;

    const { error: updateErr } = await supabaseService
      .from("leagues")
      .update(updates)
      .eq("id", league_id);

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
