"use client";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleLogout = useCallback(async () => {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/login");
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green-100">
        <div className="text-xl text-green-800">Cargando...</div>
      </div>
    );
  }

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
