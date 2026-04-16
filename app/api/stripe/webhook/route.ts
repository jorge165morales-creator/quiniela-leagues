import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseService } from "@/lib/supabase";
import { PlanTier } from "@/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err: unknown) {
    console.error("Webhook signature error:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const { tier, league_name, user_id, max_members } = session.metadata ?? {};

  if (!tier || !league_name || !user_id) {
    console.error("Missing metadata in Stripe session", session.id);
    return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
  }

  // Generate a unique invite code
  let invite_code = generateInviteCode();
  // Retry if collision (very unlikely)
  for (let i = 0; i < 5; i++) {
    const { data } = await supabaseService
      .from("leagues")
      .select("id")
      .eq("invite_code", invite_code)
      .maybeSingle();
    if (!data) break;
    invite_code = generateInviteCode();
  }

  const { error } = await supabaseService.from("leagues").insert({
    name: league_name,
    invite_code,
    predictions_locked: false,
    owner_user_id: user_id,
    plan_tier: tier as PlanTier,
    max_members: Number(max_members) || 10,
    anti_algo: true,
    custom_rules: null,
    stripe_payment_id: session.payment_intent as string,
  });

  if (error) {
    console.error("DB insert error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  console.log(`League created: ${league_name} | code: ${invite_code} | tier: ${tier}`);
  return NextResponse.json({ received: true });
}
