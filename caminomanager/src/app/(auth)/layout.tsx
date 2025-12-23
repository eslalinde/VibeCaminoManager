import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Este layout es específico para las páginas de auth
  // NO incluye sidebar ni header - solo el contenido de auth
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <Theme accentColor="amber" grayColor="mauve" panelBackground="solid">
        {children}
      </Theme>
    </div>
  );
}

