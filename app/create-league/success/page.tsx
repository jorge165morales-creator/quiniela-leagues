import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export const dynamic = "force-dynamic";

export default function CreateLeagueSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto text-center py-20">
          <div className="text-4xl mb-4 animate-bounce">⏳</div>
          <p className="text-gray-600 font-medium">Configurando tu liga…</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
