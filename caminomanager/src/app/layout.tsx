import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/header";
import "./globals.css";
import React, { ReactElement } from "react";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { QueryProvider } from "./QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ComunidadCat",
  description: "Sistema de gestión para comunidades neocatecumenales",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Theme accentColor="amber" grayColor="mauve" panelBackground="solid">
          <QueryProvider>
            {user ? (
              <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col h-screen">
                  <Header userEmail={user.email} title="ComunidadCat" />
                  <main className="flex-1 overflow-y-auto p-6">
                    {children}
                  </main>
                </div>
              </div>
            ) : (
              children
            )}
          </QueryProvider>
        </Theme>
      </body>
    </html>
  );
}
