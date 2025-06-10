"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default function AccountPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [fullname, setFullname] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [website, setWebsite] = useState<string | null>(null);
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);

  // Obtener usuario actual
  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        redirect('/login');
        return;
      }
      
      setUser(data.user);
    }
    fetchUser();
  }, [supabase]);

  const getProfile = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error, status } = await supabase
        .from("profiles")
        .select(`full_name, username, website, avatar_url`)
        .eq("id", user.id)
        .single();
      if (error && status !== 406) {
        console.log(error);
        throw error;
      }
      if (data) {
        setFullname(data.full_name);
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      alert("Error loading user data!");
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
      setLoading(true);
      const { error } = await supabase.from("profiles").upsert({
        id: user?.id as string,
        full_name: fullname,
        username,
        website,
        avatar_url,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      alert("Profile updated!");
    } catch (error) {
      alert("Error updating the data!");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Cargando usuario...</div>;
  }

  return (
    <div className="form-widget max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Editar información de usuario</h2>
      <div className="mb-4">
        <label htmlFor="email" className="block mb-1 font-medium">Email</label>
        <Input id="email" type="text" value={user?.email} disabled />
      </div>
      <div className="mb-4">
        <label htmlFor="fullName" className="block mb-1 font-medium">Nombre completo</label>
        <Input
          id="fullName"
          type="text"
          value={fullname || ""}
          onChange={(e) => setFullname(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="username" className="block mb-1 font-medium">Usuario</label>
        <Input
          id="username"
          type="text"
          value={username || ""}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="website" className="block mb-1 font-medium">Sitio web</label>
        <Input
          id="website"
          type="url"
          value={website || ""}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <Button
          className="w-full"
          onClick={() => updateProfile({ fullname, username, website, avatar_url })}
          disabled={loading}
        >
          {loading ? "Cargando ..." : "Actualizar"}
        </Button>
      </div>
    </div>
  );
} 