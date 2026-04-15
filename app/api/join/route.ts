import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { invite_code, user_id } = await req.json();

  if (!invite_code || !user_id) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Find league by invite code
  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .select("id, name, predictions_locked, max_members")
    .eq("invite_code", invite_code)
    .single();

  if (leagueError || !league) {
    return NextResponse.json({ error: "Código de liga inválido." }, { status: 404 });
  }

  // Get user
  const { data: user } = await supabase
    .from("users")
    .select("id, name, username")
    .eq("id", user_id)
    .single();

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  // Check if already in league
  const { data: existingPlayer } = await supabase
    .from("players")
    .select("id")
    .eq("league_id", league.id)
    .eq("user_id", user.id)
    .single();

  if (existingPlayer) {
    return NextResponse.json({
      player_id: existingPlayer.id,
      player_name: user.name,
      username: user.username,
      league_id: league.id,
      league_name: league.name,
      predictions_locked: league.predictions_locked,
    });
  }

  // Enforce member cap
  const { count: memberCount } = await supabase
    .from("players")
    .select("id", { count: "exact", head: true })
    .eq("league_id", league.id);

  if (memberCount !== null && memberCount >= (league.max_members ?? 10)) {
    return NextResponse.json(
      { error: `Esta liga está llena (máximo ${league.max_members} participantes).` },
      { status: 403 }
    );
  }

  // Add player to league
  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert({ league_id: league.id, name: user.name, user_id: user.id })
    .select("id")
    .single();

  if (playerError || !player) {
    return NextResponse.json({ error: "Error al unirse a la liga." }, { status: 500 });
  }

  return NextResponse.json({
    player_id: player.id,
    player_name: user.name,
    username: user.username,
    league_id: league.id,
    league_name: league.name,
    predictions_locked: league.predictions_locked,
  });
}
