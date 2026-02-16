import { updateSession } from "@/utils/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { publicRoutes } from "@/lib/routes";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ==============================================
  // RUTAS PÚBLICAS - No requieren autenticación
  // ==============================================
  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Actualizar la sesión (una sola llamada a getUser para refrescar el token)
  const { supabaseResponse, user } = await updateSession(request);

  // Si es una ruta pública, continuar sin verificar autenticación
  if (isPublicRoute) {
    return supabaseResponse;
  }

  // ==============================================
  // RUTAS PROTEGIDAS - Requieren autenticación
  // ==============================================
  // Si no está autenticado, redirigir al login
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    // Guardar la URL original para redirigir después del login
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirectTo', pathname);
    }
    const redirectResponse = NextResponse.redirect(loginUrl);
    // Copiar las cookies de supabaseResponse al redirect para que el browser
    // reciba las cookies actualizadas (ej: sesión limpiada por token expirado)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
