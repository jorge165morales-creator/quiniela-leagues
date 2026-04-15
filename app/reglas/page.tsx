"use client";

import { useEffect, useState } from "react";

export default function ReglasPage() {
  const [customRules, setCustomRules] = useState<string | null>(null);
  const [leagueName, setLeagueName] = useState<string | null>(null);

  useEffect(() => {
    const leagueId = localStorage.getItem("league_id");
    if (!leagueId) return;
    fetch(`/api/league/info?league_id=${leagueId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.league) {
          setLeagueName(d.league.name);
          setCustomRules(d.league.custom_rules ?? null);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-black mb-2 text-gray-900">Reglas</h1>
      <p className="text-gray-500 mb-8">
        {leagueName ? leagueName : "Quiniela Mundial 2026"} — Fase de Grupos
      </p>

      {/* League custom rules — only shown if set by owner */}
      {customRules && (
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-4 shadow-sm">
          <h2 className="text-lg font-bold text-amber-800 mb-3">📋 Reglas de la liga</h2>
          <p className="text-amber-900 text-sm whitespace-pre-wrap leading-relaxed">{customRules}</p>
        </section>
      )}

      {/* Predicciones */}
      <section className="bg-white rounded-2xl p-6 mb-4 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-fifa-blue mb-3">Predicciones</h2>
        <ul className="text-gray-600 space-y-2 text-sm">
          <li className="flex gap-2"><span className="text-fifa-gold shrink-0 font-bold">•</span>Cada participante predice el marcador exacto de los <strong className="text-gray-900">72 partidos</strong> de la fase de grupos.</li>
          <li className="flex gap-2"><span className="text-fifa-gold shrink-0 font-bold">•</span><span>Las predicciones deben enviarse antes de que inicie el torneo. Una vez cerradas, no se pueden modificar.</span></li>
          <li className="flex gap-2"><span className="text-fifa-gold shrink-0 font-bold">•</span>Puedes guardar tu progreso y regresar a completarlas antes del cierre.</li>
        </ul>
      </section>

      {/* Puntuación */}
      <section className="bg-white rounded-2xl p-6 mb-4 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-fifa-blue mb-4">Sistema de puntuación</h2>
        <div className="flex flex-col gap-0">
          {[
            { label: "Marcador exacto", desc: "Adivinaste el resultado y los goles de ambos equipos", pts: "6 pts", color: "text-fifa-gold" },
            { label: "Resultado correcto + 1 gol exacto", desc: "Acertaste quién gana/empata y un marcador individual", pts: "4 pts", color: "text-blue-600" },
            { label: "Empate correcto (marcador incorrecto)", desc: "Predijiste empate y fue empate, pero diferente marcador", pts: "4 pts", color: "text-blue-600" },
            { label: "Resultado correcto + 0 goles exactos", desc: "Acertaste quién gana/empata pero ningún marcador", pts: "3 pts", color: "text-green-600" },
            { label: "Resultado incorrecto + 1 gol exacto", desc: "No acertaste el resultado pero sí un marcador individual", pts: "1 pt", color: "text-orange-500" },
            { label: "Resultado incorrecto + 0 goles exactos", desc: "Sin aciertos", pts: "0 pts", color: "text-gray-300" },
          ].map((row, i, arr) => (
            <div key={i} className={`flex items-center justify-between py-3.5 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{row.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{row.desc}</p>
              </div>
              <span className={`text-2xl font-black ml-4 shrink-0 ${row.color}`}>{row.pts}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Desempate */}
      <section className="bg-white rounded-2xl p-6 mb-4 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-fifa-blue mb-3">Desempate</h2>
        <p className="text-gray-600 text-sm">
          En caso de empate en puntos totales, gana quien tenga más <strong className="text-gray-900">marcadores exactos (6 pts)</strong>.
          Si persiste el empate, el premio se divide en partes iguales.
        </p>
      </section>

      {/* Premiación */}
      <section className="bg-white rounded-2xl p-6 mb-4 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-fifa-blue mb-1">Premiación</h2>
        <p className="text-sm text-gray-500 mb-4">Distribución del pozo acumulado al finalizar la fase de grupos.</p>
        <div className="flex flex-col gap-0">
          {[
            { label: "1er lugar", emoji: "🥇", pct: "60%", color: "text-fifa-gold" },
            { label: "2do lugar", emoji: "🥈", pct: "30%", color: "text-gray-500" },
            { label: "3er lugar", emoji: "🥉", pct: "10%", color: "text-orange-500" },
          ].map((row, i, arr) => (
            <div key={i} className={`flex items-center justify-between py-3.5 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{row.emoji}</span>
                <p className="font-semibold text-gray-900 text-sm">{row.label}</p>
              </div>
              <span className={`text-2xl font-black ml-4 shrink-0 ${row.color}`}>{row.pct}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
