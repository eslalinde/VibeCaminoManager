"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Verificar si el usuario ya está autenticado (usando getUser para validar
  // el token con el servidor y evitar loops si la sesión expiró)
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        router.replace("/");
        return;
      }
      setCheckingAuth(false);
    }
    checkAuth();
  }, [router]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;
      const full_name = formData.get('full_name') as string;

      if (!email || !password || !confirmPassword || !full_name) {
        setError('Todos los campos son requeridos');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }
      if (!email.includes('@')) {
        setError('El email no es válido');
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const siteUrl = window.location.origin;

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name },
          emailRedirectTo: `${siteUrl}/auth/confirm`,
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Este email ya está registrado. Intenta iniciar sesión.');
        } else if (authError.message.includes('password')) {
          setError('La contraseña no cumple con los requisitos de seguridad.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        router.replace('/');
        return;
      }

      if (data.user && !data.session) {
        setSuccess('¡Cuenta creada exitosamente! Por favor, revisa tu email para confirmar tu cuenta antes de iniciar sesión.');
      }
    } catch (err) {
      console.error('Error en signup:', err);
      setError('Error interno. Intenta nuevamente.');
    }

    setLoading(false);
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

        {/* Card de registro */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Crear cuenta</h2>

          <form action={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="full_name" className="block mb-1.5 text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                required
                placeholder="Tu nombre completo"
              />
            </div>
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
                minLength={6}
              />
              <p className="text-xs text-gray-400 mt-1">
                Mínimo 6 caracteres
              </p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block mb-1.5 text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-700 text-sm bg-green-50 border border-green-200 p-4 rounded-lg">
                <p>{success}</p>
                <Link
                  href="/login"
                  className="block mt-2 text-amber-600 hover:text-amber-700 font-medium"
                >
                  Ir a iniciar sesión
                </Link>
              </div>
            )}

            {!success && (
              <Button type="submit" className="w-full" size="3" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
