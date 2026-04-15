"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PLAN_CONFIG, PlanTier } from "@/types";

const PLANS: { tier: PlanTier; emoji: string; highlight?: boolean }[] = [
  { tier: "starter",  emoji: "🥉" },
  { tier: "basic",    emoji: "🥈", highlight: true },
  { tier: "standard", emoji: "🥇" },
  { tier: "premium",  emoji: "💎" },
];

export default function CreateLeaguePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [selected, setSelected] = useState<PlanTier>("basic");
  const [leagueName, setLeagueName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const uid = localStorage.getItem("user_id");
    const uname = localStorage.getItem("username");
    setUserId(uid);
    setUsername(uname);
  }, []);

  async function handleCheckout() {
    if (!userId) {
      router.push("/login?next=/create-league");
      return;
    }
    if (!leagueName.trim()) {
      setError("Ingresa un nombre para tu liga.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selected, league_name: leagueName.trim(), user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar pago");
      window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Crea tu liga</h1>
        <p className="text-gray-500">
          Elige un plan, personaliza las reglas y comparte el código de invitación con tus amigos.
        </p>
      </div>

      {/* Login prompt */}
      {!userId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 mb-6 text-sm text-yellow-800 font-medium">
          Debes <button onClick={() => router.push("/login?next=/create-league")} className="underline font-bold">iniciar sesión</button> para crear una liga.
        </div>
      )}

      {/* League name */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la liga</label>
        <input
          type="text"
          value={leagueName}
          onChange={(e) => setLeagueName(e.target.value)}
          placeholder="Ej: Quiniela Oficina 2026"
          maxLength={50}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-fifa-blue"
        />
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {PLANS.map(({ tier, emoji, highlight }) => {
          const cfg = PLAN_CONFIG[tier];
          const active = selected === tier;
          return (
            <button
              key={tier}
              onClick={() => setSelected(tier)}
              className={`relative rounded-2xl p-5 text-left border-2 transition-all ${
                active
                  ? "border-fifa-blue bg-fifa-blue/5 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {highlight && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-fifa-blue text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Popular
                </span>
              )}
              <div className="text-2xl mb-2">{emoji}</div>
              <div className="font-black text-gray-900 text-base">{cfg.label}</div>
              <div className="text-2xl font-black text-fifa-blue mt-1">${cfg.price}</div>
              <div className="text-xs text-gray-500 mt-1">Hasta {cfg.max} participantes</div>
              {active && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-fifa-blue flex items-center justify-center">
                  <span className="text-white text-[10px] font-black">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* What you get */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <p className="text-sm font-bold text-gray-700 mb-3">Qué incluye tu liga:</p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><span className="text-green-500 font-bold shrink-0">✓</span>Código de invitación exclusivo</li>
          <li className="flex gap-2"><span className="text-green-500 font-bold shrink-0">✓</span>Panel de admin para gestionar tu liga</li>
          <li className="flex gap-2"><span className="text-green-500 font-bold shrink-0">✓</span>Reglas personalizadas (texto libre)</li>
          <li className="flex gap-2"><span className="text-green-500 font-bold shrink-0">✓</span>Activar o desactivar validación anti-algorítmica</li>
          <li className="flex gap-2"><span className="text-green-500 font-bold shrink-0">✓</span>Cerrar predicciones cuando quieras</li>
          <li className="flex gap-2"><span className="text-gray-300 font-bold shrink-0">✗</span>No incluye premios especiales (Rondas, Goles, Último 0)</li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4 font-medium">
          {error}
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-fifa-blue text-white font-black py-4 rounded-2xl text-base hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading
          ? "Redirigiendo a pago..."
          : `Pagar $${PLAN_CONFIG[selected].price} y crear liga`}
      </button>

      <p className="text-center text-xs text-gray-400 mt-3">
        Pago seguro con Stripe. Recibirás el código de invitación de inmediato.
      </p>
    </div>
  );
}
