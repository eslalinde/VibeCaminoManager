"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loginAction } from "./actions";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const searchParams = useSearchParams();

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Si ya está autenticado, redirigir a la página solicitada o principal
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

  // Mostrar loading mientras verificamos autenticación
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium">
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
              <label htmlFor="password" className="block mb-1 text-sm font-medium">
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
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <Link href="/signup" className="text-blue-600 hover:text-blue-800 underline">
                Crear cuenta
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
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
