"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signupAction } from "./actions";
import Link from "next/link";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await signupAction(formData);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(result.success);
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      setError("Error interno del servidor. Intenta nuevamente.");
    }
    
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block mb-1 text-sm font-medium">
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
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 6 caracteres
              </p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium">
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
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded">
                {success}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
            
            <div className="text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 underline">
                Iniciar sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
