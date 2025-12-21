import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Define protected paths - todas las rutas bajo /protected/ están protegidas
  // La página raíz (/) también está protegida
  const protectedPaths = ['/protected', '/dashboard', '/admin', '/account'];
  
  // 2. Check if the current path is protected
  // La raíz (/) también está protegida a menos que sea una ruta pública explícita
  const isProtected = pathname === '/' || protectedPaths.some((path) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  });

  // 3. Skip auth check for public routes and auth actions
  // Nota: La página raíz (/) es privada y requiere autenticación
  const publicRoutes = ['/login', '/signup', '/auth', '/public', '/test-signup'];
  const authActionRoutes = ['/auth/signout', '/auth/confirm'];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  ) || authActionRoutes.some((route) => pathname === route);

  // 4. Skip session update for auth action routes to avoid interference
  if (authActionRoutes.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // 5. Always update the session first (refresh tokens if needed)
  let response = await updateSession(request);

  if (isProtected && !isPublicRoute) {
    // 5. Create a Supabase client to check user authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // 6. If not authenticated or error occurred, redirect to login
    if (!user || error) {
      const loginUrl = new URL('/login', request.url);
      // Opcional: agregar el path original como parámetro para redirección después del login
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
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
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",    
  ],
};
