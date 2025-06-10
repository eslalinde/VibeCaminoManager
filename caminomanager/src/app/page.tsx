import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full"
      title="Inicio"
    >
      <h1 className="text-4xl font-bold mb-4 text-primary">Bienvenido a CaminoManager</h1>
      <p className="mb-8 text-lg text-gray-700 text-center max-w-xl">
        Gestiona comunidades neocatecumenales de manera eficiente. Utiliza la navegación lateral para acceder a las diferentes secciones del sistema.
      </p>
    </div>
  );
} 