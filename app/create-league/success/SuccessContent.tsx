"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [league, setLeague] = useState<{ name: string; invite_code: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    let attempts = 0;
    const userId = localStorage.getItem("user_id");
    if (!userId) { setLoading(false); return; }

    const poll = async () => {
      attempts++;
      const res = await fetch(`/api/league/my?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.league) {
          setLeague(data.league);
          setLoading(false);
          return;
        }
      }
      if (attempts < 10) {
        setTimeout(poll, 1500);
      } else {
        setLoading(false);
      }
    };
    poll();
  }, [sessionId]);

  function copyCode() {
    if (!league) return;
    navigator.clipboard.writeText(league.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="text-4xl mb-4 animate-bounce">⏳</div>
        <p className="text-gray-600 font-medium">Configurando tu liga…</p>
        <p className="text-gray-400 text-sm mt-1">Esto tarda unos segundos.</p>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-gray-700 font-semibold mb-2">No pudimos encontrar tu liga</p>
        <p className="text-gray-400 text-sm mb-6">
          El pago fue procesado, pero la liga puede tardar un momento más. Revisa <Link href="/my-league" className="text-fifa-blue underline">Mi liga</Link> en unos minutos.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="bg-gradient-to-br from-[#001E62] to-[#003DA5] rounded-3xl p-10 text-white mb-6 shadow-xl">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-black mb-1">¡Liga creada!</h1>
        <p className="text-white/70 text-sm mb-6">{league.name}</p>

        <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-5 mb-4">
          <p className="text-white/60 text-xs uppercase tracking-widest font-bold mb-2">Código de invitación</p>
          <p className="text-3xl font-black tracking-widest">{league.invite_code}</p>
        </div>

        <button
          onClick={copyCode}
          className="w-full bg-white text-fifa-blue font-black py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
        >
          {copied ? "¡Copiado!" : "Copiar código"}
        </button>
      </div>

      <p className="text-gray-500 text-sm mb-6">
        Comparte este código con tus amigos para que se unan. También puedes configurar las reglas y ajustes desde tu panel de liga.
      </p>

      <div className="flex flex-col gap-3">
        <Link
          href="/my-league"
          className="w-full bg-fifa-blue text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
        >
          Ir a Mi liga →
        </Link>
        <Link
          href="/"
          className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-sm hover:bg-gray-200 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
