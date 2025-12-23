"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string || "/";
  
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    // Mensajes de error más amigables
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Credenciales inválidas. Verifica tu email y contraseña." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Por favor, confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada." };
    }
    return { error: error.message };
  }
  
  // Redirige a la página solicitada o a la raíz
  redirect(redirectTo);
}

