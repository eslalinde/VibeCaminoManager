"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error("Error occurred:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-20">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">¡Ha ocurrido un error!</h2>
        <p className="mb-6 text-gray-600">
          {error.message || "Algo salió mal. Por favor, intenta de nuevo."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            onClick={() => reset()}
          >
            Reintentar
          </button>
          <button
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
            onClick={() => router.push("/")}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
} 