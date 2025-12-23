import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";

export default async function PublicPage() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-2xl font-bold text-gray-800">
        Esta página es pública.
      </div>
    </div>
  );
}
