import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PLAN_CONFIG, PlanTier } from "@/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

const PRICE_MAP: Record<PlanTier, string> = {
  starter:  process.env.STRIPE_PRICE_STARTER!,
  basic:    process.env.STRIPE_PRICE_BASIC!,
  standard: process.env.STRIPE_PRICE_STANDARD!,
  premium:  process.env.STRIPE_PRICE_PREMIUM!,
};

export async function POST(req: NextRequest) {
  try {
    const { tier, league_name, user_id } = await req.json();

    if (!tier || !league_name || !user_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!(tier in PLAN_CONFIG)) {
      return NextResponse.json({ error: "Invalid plan tier" }, { status: 400 });
    }

    const cfg = PLAN_CONFIG[tier as PlanTier];
    const priceId = PRICE_MAP[tier as PlanTier];

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        tier,
        league_name,
        user_id,
        max_members: String(cfg.max),
      },
      success_url: `${baseUrl}/create-league/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/create-league`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe error" },
      { status: 500 }
    );
  }
}
