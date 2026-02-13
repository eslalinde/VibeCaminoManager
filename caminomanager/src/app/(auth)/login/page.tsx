"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAction } from "./actions";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const searchParams = useSearchParams();

  // Verificar si el usuario ya está autenticado (usando getSession para no
  // disparar un refresh token request innecesario - el middleware ya lo maneja)
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const redirectTo = searchParams.get('redirectTo') || '/';
        router.replace(redirectTo);
        return;
      }
      setCheckingAuth(false);
    }
    checkAuth();
  }, [router, searchParams]);

  // Mostrar error de confirmación de email si existe
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'email_confirmation_failed') {
      setError('Error al confirmar el email. Por favor, intenta registrarte de nuevo o contacta soporte.');
    }
  }, [searchParams]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      const redirectTo = searchParams.get('redirectTo') || '/';
      formData.append('redirectTo', redirectTo);

      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError('Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // Loading mientras verificamos autenticación
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="w-full max-w-md px-4">
        {/* Logo y nombre de la app */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="ComunidadCat Logo"
            width={80}
            height={80}
            className="rounded-full shadow-lg mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-800">ComunidadCat</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de comunidades del Camino Neocatecumenal</p>
        </div>

        {/* Card de login */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Iniciar sesión</h2>

          <form action={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="tucorreo@ejemplo.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" size="3" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
            ¿No tienes una cuenta?{" "}
            <Link href="/signup" className="text-amber-600 hover:text-amber-700 font-medium">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
