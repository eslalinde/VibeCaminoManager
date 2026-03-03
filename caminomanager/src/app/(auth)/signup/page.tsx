"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

const signupSchema = z
  .object({
    full_name: z.string().min(1, "El nombre es requerido"),
    email: z.string().min(1, "El correo es requerido").email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Verificar si el usuario ya está autenticado
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

  async function onSubmit(values: SignupFormValues) {
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      const siteUrl = window.location.origin;

      const { data, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { full_name: values.full_name },
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
  }

  // Loading mientras verificamos autenticación
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B3A6F] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full max-w-md px-4">
        {/* Logo y nombre de la app */}
        <div className="flex flex-col items-center mb-8">
          <BrandLogo size="lg" className="mb-2" />
          <p className="text-gray-500 text-sm mt-1">Gestión de comunidades del Camino Neocatecumenal</p>
        </div>

        {/* Card de registro */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Crear cuenta</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Nombre completo
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Tu nombre completo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Correo electrónico
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tucorreo@ejemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Contraseña
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-400 mt-1">
                      Mínimo 6 caracteres
                    </p>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Confirmar contraseña
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    className="block mt-2 text-[#1B3A6F] hover:text-[#15305C] font-medium"
                  >
                    Ir a iniciar sesión
                  </Link>
                </div>
              )}

              {!success && (
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                </Button>
              )}
            </form>
          </Form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-[#1B3A6F] hover:text-[#15305C] font-medium">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
