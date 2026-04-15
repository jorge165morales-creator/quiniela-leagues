"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { League, PLAN_CONFIG } from "@/types";

export default function MyLeaguePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Editable fields
  const [antiAlgo, setAntiAlgo] = useState(true);
  const [customRules, setCustomRules] = useState("");
  const [locked, setLocked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem("user_id");
    if (!uid) { router.push("/login?next=/my-league"); return; }
    setUserId(uid);
    fetch(`/api/league/my?user_id=${uid}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.league) {
          setLeague(d.league);
          setAntiAlgo(d.league.anti_algo);
          setCustomRules(d.league.custom_rules ?? "");
          setLocked(d.league.predictions_locked);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function save() {
    if (!userId || !league) return;
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/league/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        league_id: league.id,
        anti_algo: antiAlgo,
        custom_rules: customRules,
        predictions_locked: locked,
      }),
    });
    const data = await res.json();
    setSaving(false);
    setMsg(res.ok ? "Guardado ✓" : data.error || "Error al guardar");
  }

  function copyCode() {
    if (!league) return;
    navigator.clipboard.writeText(league.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="text-3xl animate-pulse">⏳</div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="text-5xl mb-4">🏟️</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Todavía no tienes una liga</h1>
        <p className="text-gray-500 text-sm mb-6">
          Crea tu propia liga y comparte el código de invitación con tus amigos.
        </p>
        <Link
          href="/create-league"
          className="bg-fifa-blue text-white font-bold px-6 py-3 rounded-2xl text-sm hover:opacity-90 transition-opacity inline-block"
        >
          Crear liga →
        </Link>
      </div>
    );
  }

  const cfg = PLAN_CONFIG[league.plan_tier];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-1">Mi liga</h1>
        <p className="text-gray-500 text-sm">Panel de administrador · {cfg.label} plan</p>
      </div>

      {/* League card */}
      <div className="bg-gradient-to-br from-[#001E62] to-[#003DA5] rounded-2xl p-6 text-white mb-6 shadow-lg">
        <p className="text-white/60 text-xs uppercase tracking-widest font-bold mb-1">Liga</p>
        <h2 className="text-xl font-black mb-4">{league.name}</h2>

        <div className="flex items-center justify-between bg-white/10 border border-white/20 rounded-xl px-4 py-3">
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-0.5">Código de invitación</p>
            <p className="text-xl font-black tracking-widest">{league.invite_code}</p>
          </div>
          <button
            onClick={copyCode}
            className="bg-white text-fifa-blue font-bold text-xs px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shrink-0"
          >
            {copied ? "¡Copiado!" : "Copiar"}
          </button>
        </div>

        <div className="flex gap-4 mt-4 text-sm">
          <div>
            <p className="text-white/60 text-xs">Plan</p>
            <p className="font-bold">{cfg.label}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Máx. participantes</p>
            <p className="font-bold">{cfg.max}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Estado</p>
            <p className="font-bold">{locked ? "🔒 Cerrada" : "🟢 Abierta"}</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <h3 className="font-bold text-gray-900 mb-4">Configuración</h3>

        {/* Lock predictions */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Cerrar predicciones</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {locked ? "Las predicciones están cerradas." : "Los participantes aún pueden enviar predicciones."}
            </p>
          </div>
          <button
            onClick={() => setLocked((v) => !v)}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
              locked ? "bg-red-500" : "bg-green-500"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${
                locked ? "translate-x-5.5 ml-0.5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Anti-algo toggle */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Validación anti-algorítmica</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {antiAlgo
                ? "Activa: se rechazarán quinielas algorítmicas."
                : "Desactivada: se aceptan todos los patrones."}
            </p>
          </div>
          <button
            onClick={() => setAntiAlgo((v) => !v)}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
              antiAlgo ? "bg-fifa-blue" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${
                antiAlgo ? "translate-x-5.5 ml-0.5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Custom rules */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-1">Reglas personalizadas</h3>
        <p className="text-xs text-gray-400 mb-3">
          Visible para todos los participantes de tu liga en la página de Reglas.
        </p>
        <textarea
          value={customRules}
          onChange={(e) => setCustomRules(e.target.value)}
          placeholder="Escribe aquí las reglas de tu liga: costo de inscripción, a quién pagar, fechas, premios, etc."
          rows={6}
          maxLength={2000}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-fifa-blue resize-none"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{customRules.length}/2000</p>
      </div>

      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium mb-4 ${
          msg.startsWith("Guardado") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {msg}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-fifa-blue text-white font-black py-4 rounded-2xl text-base hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Accesos rápidos</p>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/leaderboard"
            className="bg-gray-100 text-gray-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Ver tabla
          </Link>
          <Link
            href="/reglas"
            className="bg-gray-100 text-gray-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Ver reglas
          </Link>
        </div>
      </div>
    </div>
  );
}
