'use client';

import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import React from "react";
import { Theme } from "@radix-ui/themes";
import { useAuth } from "@/contexts/AuthContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthProvider handles redirect
  }

  return (
    <Theme accentColor="amber" grayColor="mauve" panelBackground="solid">
      <div className="flex h-screen bg-amber-50/40 print:block print:h-auto print:bg-white">
        <div className="print-hidden">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col h-screen print:block print:h-auto">
          <div className="print-hidden">
            <Header userEmail={user.email} userName={profile?.full_name ?? undefined} title="ComunidadCat" />
          </div>
          <main className="flex-1 overflow-y-auto p-4 print:p-0 print:overflow-visible">
            <Breadcrumbs />
            {children}
          </main>
        </div>
      </div>
    </Theme>
  );
}
