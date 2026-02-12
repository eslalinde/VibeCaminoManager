import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ==============================================
  // RUTAS PÚBLICAS - No requieren autenticación
  // ==============================================
  const publicRoutes = [
    '/login',
    '/signup',
    '/public',
    '/auth/confirm',
    '/auth/signout',
  ];
  
  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Si es una ruta pública, solo actualizar la sesión y continuar
  if (isPublicRoute) {
    return await updateSession(request);
  }

  // ==============================================
  // RUTAS PROTEGIDAS - Requieren autenticación
  // ==============================================
  // Todas las demás rutas requieren autenticación (incluida /)
  
  // Actualizar la sesión primero
  let response = await updateSession(request);

  // Crear cliente de Supabase para verificar autenticación
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  // Si no está autenticado, redirigir al login
  if (!user || error) {
    const loginUrl = new URL('/login', request.url);
    // Guardar la URL original para redirigir después del login
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirectTo', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (if you have any)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",    
  ],
};
