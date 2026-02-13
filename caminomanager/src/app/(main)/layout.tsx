import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/header";
import React from "react";
import { Theme } from "@radix-ui/themes";
import { SupabaseAuthListener } from "@/components/auth/SupabaseAuthListener";

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

  // Fetch user's profile to get full_name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  return (
    <Theme accentColor="amber" grayColor="mauve" panelBackground="solid">
      <SupabaseAuthListener />
      <div className="flex h-screen bg-amber-50/40 print:block print:h-auto print:bg-white">
        <div className="print-hidden">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col h-screen print:block print:h-auto">
          <div className="print-hidden">
            <Header userEmail={user.email} userName={profile?.full_name} title="ComunidadCat" />
          </div>
          <main className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible">
            {children}
          </main>
        </div>
      </div>
    </Theme>
  );
}

