import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ComponentType } from "react";

interface AuthUser {
  id: string;
  email?: string;
  // Agrega más propiedades según necesites
}

interface WithAuthProps {
  user: AuthUser;
}

export function withAuth<P extends WithAuthProps>(
  WrappedComponent: ComponentType<P>
) {
  return async function AuthenticatedComponent(
    props: Omit<P, keyof WithAuthProps>
  ) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user || error) {
      redirect('/login');
    }

    // Pasamos el usuario como prop al componente
    return <WrappedComponent {...(props as P)} user={user} />;
  };
} 