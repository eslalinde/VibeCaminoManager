"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const full_name = formData.get("full_name") as string;

  // Validaciones del lado del servidor
  if (!email || !password || !confirmPassword || !full_name) {
    return { error: "Todos los campos son requeridos" };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  if (!email.includes("@")) {
    return { error: "El email no es válido" };
  }

  try {
    const supabase = await createClient();
    
    // Crear el usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      },
    });

    if (error) {
      console.error("Error en signup:", error);
      return { error: error.message };
    }

    if (data.user && !data.user.email_confirmed_at) {
      // Si la confirmación de email está habilitada
      return { 
        success: "Cuenta creada exitosamente. Por favor, revisa tu email para confirmar tu cuenta antes de iniciar sesión." 
      };
    } else if (data.user) {
      // Si la confirmación de email está deshabilitada, redirigir al login
      return { 
        success: "Cuenta creada exitosamente. Ya puedes iniciar sesión." 
      };
    }

    return { error: "Error inesperado al crear la cuenta" };

  } catch (error) {
    console.error("Error inesperado:", error);
    return { error: "Error interno del servidor. Intenta nuevamente." };
  }
}
