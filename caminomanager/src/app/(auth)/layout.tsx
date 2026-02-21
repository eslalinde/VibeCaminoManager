"use client";
import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { WindowControls } from "@/components/electron/WindowControls";

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
      {/* Drag region + window controls for Electron frameless window */}
      <div
        className="fixed top-0 left-0 right-0 h-8 z-50"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="absolute right-0 top-0" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <WindowControls />
        </div>
      </div>
      <Theme accentColor="amber" grayColor="mauve" panelBackground="solid">
        {children}
      </Theme>
    </div>
  );
}

