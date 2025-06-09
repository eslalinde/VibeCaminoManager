"use client";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { redirect, useRouter } from "next/navigation";
import { useCallback } from "react";

export default async function HomePage() {
  const router = useRouter();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const handleLogout = useCallback(async () => {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-100 flex-col gap-6">
      <div className="text-2xl font-bold text-green-800">
        ¡Bienvenido! Has iniciado sesión correctamente.
      </div>
      <Button variant="outline" onClick={handleLogout} className="w-full max-w-xs">
        Cerrar sesión
      </Button>
    </div>
  );
}
