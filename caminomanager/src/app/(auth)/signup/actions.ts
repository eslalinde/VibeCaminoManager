"use server";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

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
    
    // Obtener la URL del sitio de forma dinámica si no está configurada
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
    
    // Crear el usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name,
        },
        emailRedirectTo: `${siteUrl}/auth/confirm`,
      },
    });

    if (error) {
      console.error("Error en signup:", error);
      
      // Mensajes de error más amigables
      if (error.message.includes("already registered")) {
        return { error: "Este email ya está registrado. Intenta iniciar sesión." };
      }
      if (error.message.includes("password")) {
        return { error: "La contraseña no cumple con los requisitos de seguridad." };
      }
      
      return { error: error.message };
    }

    // Si el usuario tiene sesión activa (confirmación de email deshabilitada)
    // indicar al cliente que debe redirigir
    if (data.session) {
      return { 
        success: "¡Cuenta creada exitosamente!",
        redirectTo: "/"
      };
    }

    // Si no hay sesión pero hay usuario, significa que necesita confirmar email
    if (data.user && !data.session) {
      return { 
        success: "¡Cuenta creada exitosamente! Por favor, revisa tu email para confirmar tu cuenta antes de iniciar sesión.",
        requiresEmailConfirmation: true
      };
    }

    return { error: "Error inesperado al crear la cuenta" };

  } catch (error) {
    console.error("Error inesperado:", error);
    return { error: "Error interno del servidor. Intenta nuevamente." };
  }
}

