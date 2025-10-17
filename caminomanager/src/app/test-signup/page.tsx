"use client";
import { useState } from "react";

export default function TestSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Importar dinámicamente para evitar problemas de compilación
      const { createBrowserClient } = await import('@supabase/ssr');
      
      const supabase = createBrowserClient(
        "https://jdertywnlkktfzocvndd.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZXJ0eXdubGtrdGZ6b2N2bmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MjIyNzIsImV4cCI6MjA2Mjk5ODI3Mn0.kQLsMIAMDcSOm_tti2LhGexAmTNG45PM5gNcdvXdmAY"
      );

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else if (data.user) {
        setMessage("Usuario creado exitosamente!");
        setEmail("");
        setPassword("");
        setFullName("");
      }
    } catch (error) {
      setMessage(`Error inesperado: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Prueba de Registro</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              minLength={6}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>
        
        {message && (
          <div className={`mt-4 p-3 rounded ${
            message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}>
            {message}
          </div>
        )}
        
        <div className="mt-4 text-center">
          <a href="/login" className="text-blue-600 hover:underline">
            Volver al login
          </a>
        </div>
      </div>
    </div>
  );
}
