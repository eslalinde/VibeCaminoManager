import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Roboto } from "next/font/google";
import "./globals.css";
import React from "react";
import "@radix-ui/themes/styles.css";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { UpdateNotification } from "@/components/electron/UpdateNotification";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "ComunidadCat",
  description: "Sistema de gestión para comunidades neocatecumenales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${roboto.variable} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <UpdateNotification />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
