"use client";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-100">
      <div className="text-2xl font-bold text-blue-800">
        Esta página es privada.
      </div>
    </div>
  );
}
