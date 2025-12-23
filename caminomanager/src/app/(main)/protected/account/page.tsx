"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type AppRole = 'viewer' | 'contributor' | 'admin';

const roleLabels: Record<AppRole, string> = {
  viewer: '👁️ Visualizador (solo lectura)',
  contributor: '✏️ Colaborador (lectura y escritura)',
  admin: '🔐 Administrador (acceso completo)',
};

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [fullname, setFullname] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [website, setWebsite] = useState<string | null>(null);
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Obtener usuario actual
  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push('/login');
        return;
      }
      
      setUser(data.user);
    }
    fetchUser();
  }, [supabase, router]);

  const getProfile = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error, status } = await supabase
        .from("profiles")
        .select(`full_name, username, website, avatar_url, role`)
        .eq("id", user.id)
        .single();
      if (error && status !== 406) {
        console.error("Error loading profile:", error);
        setMessage({ type: 'error', text: 'Error al cargar los datos del perfil.' });
        return;
      }
      if (data) {
        setFullname(data.full_name);
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
        setRole(data.role as AppRole);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setMessage({ type: 'error', text: 'Error inesperado al cargar los datos.' });
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) getProfile();
  }, [user, getProfile]);

  async function updateProfile({
    username,
    fullname,
    website,
    avatar_url,
  }: {
    username: string | null;
    fullname: string | null;
    website: string | null;
    avatar_url: string | null;
  }) {
    try {
      setSaving(true);
      setMessage(null);
      
      const { error } = await supabase.from("profiles").update({
        full_name: fullname,
        username,
        website,
        avatar_url,
        updated_at: new Date().toISOString(),
      }).eq('id', user?.id);
      
      if (error) {
        console.error("Error updating profile:", error);
        setMessage({ type: 'error', text: 'Error al actualizar el perfil.' });
        return;
      }
      
      setMessage({ type: 'success', text: '¡Perfil actualizado correctamente!' });
    } catch (error) {
      console.error("Unexpected error:", error);
      setMessage({ type: 'error', text: 'Error inesperado al guardar.' });
    } finally {
      setSaving(false);
    }
  }

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Mi Perfil</h2>
        
        {/* Mostrar rol del usuario */}
        {role && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-800">Tu rol actual:</p>
            <p className="text-lg text-amber-900">{roleLabels[role]}</p>
            {role === 'viewer' && (
              <p className="text-xs text-amber-700 mt-1">
                Solo puedes ver los datos. Contacta a un administrador para obtener permisos de edición.
              </p>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <Input 
              id="email" 
              type="text" 
              value={user?.email || ''} 
              disabled 
              className="bg-gray-100"
            />
          </div>
          
          <div>
            <label htmlFor="fullName" className="block mb-1 text-sm font-medium text-gray-700">
              Nombre completo
            </label>
            <Input
              id="fullName"
              type="text"
              value={fullname || ""}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Tu nombre completo"
            />
          </div>
          
          <div>
            <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-700">
              Nombre de usuario
            </label>
            <Input
              id="username"
              type="text"
              value={username || ""}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="usuario123"
            />
          </div>
          
          <div>
            <label htmlFor="website" className="block mb-1 text-sm font-medium text-gray-700">
              Sitio web
            </label>
            <Input
              id="website"
              type="url"
              value={website || ""}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://ejemplo.com"
            />
          </div>
          
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}
          
          <Button
            className="w-full"
            onClick={() => updateProfile({ fullname, username, website, avatar_url })}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
} 