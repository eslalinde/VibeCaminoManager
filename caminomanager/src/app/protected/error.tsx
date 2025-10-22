"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <h2 className="text-2xl font-bold mb-4 text-red-600">¡Ha ocurrido un error!</h2>
      <p className="mb-6 text-gray-700">{error.message || "Algo salió mal. Por favor, intenta de nuevo."}</p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => router.push("/protected/countries")}
      >
        Volver a Países
      </button>
    </div>
  );
} 