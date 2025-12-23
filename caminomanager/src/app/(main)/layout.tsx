import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/header";
import React from "react";
import { Theme } from "@radix-ui/themes";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay usuario, el middleware ya debería haber redirigido
  // pero por seguridad adicional, redirigimos aquí también
  if (!user) {
    redirect("/login");
  }

  return (
    <Theme accentColor="amber" grayColor="mauve" panelBackground="solid">
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen">
          <Header userEmail={user.email} title="ComunidadCat" />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </Theme>
  );
}

