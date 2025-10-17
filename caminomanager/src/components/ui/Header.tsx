"use client";
import { Moon, Sun, User as UserIcon, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import "@radix-ui/themes/styles.css";

interface HeaderProps {
  userEmail?: string;
  title?: string;
}

function getInitials(email?: string) {
  if (!email) return "U";
  const [name] = email.split("@");
  const parts = name.split(/[._-]/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
  return (
    (parts[0][0] || "").toUpperCase() + (parts[1]?.[0] || "").toUpperCase()
  );
}

export default function Header({ userEmail, title }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Toggle dark mode (add/remove 'dark' class on html)
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        document.documentElement.classList.toggle("dark", next);
      }
      return next;
    });
  };

  // Cerrar el menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b h-16 flex items-center px-4 justify-between">
      <div className="font-semibold text-xl text-gray-900 dark:text-white">
        {title ? title : null}
      </div>
      <div className="flex items-center space-x-4 relative">
        <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <button
              className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer border-2 border-gray-300 dark:border-gray-600 focus:outline-none"
              aria-label="Abrir menú de usuario"
            >
              <span className="text-gray-700 dark:text-gray-200 font-bold text-lg">
                {getInitials(userEmail)}
              </span>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" sideOffset={8} className="min-w-[200px] rounded-md bg-white dark:bg-gray-900 p-2 shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <DropdownMenu.Label className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 font-semibold">Cuenta</DropdownMenu.Label>
            <DropdownMenu.Item asChild>
              <Link
                href="/protected/account"
                className="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                <UserIcon className="w-4 h-4" />
                Mi Perfil
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-2 h-px bg-gray-200 dark:bg-gray-700" />
            <DropdownMenu.Item asChild>
              <button
                className="flex items-center gap-2 w-full px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  toggleDarkMode();
                  setMenuOpen(false);
                }}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                <span className="flex-1">Dark Mode</span>
                <span className="ml-auto">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    readOnly
                    className="accent-blue-600"
                  />
                </span>
              </button>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-2 h-px bg-gray-200 dark:bg-gray-700" />
            <DropdownMenu.Item asChild>
              <button
                type="button"
                className="flex items-center gap-2 w-full px-2 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                onClick={async () => {
                  try {
                    setMenuOpen(false);
                    const response = await fetch('/auth/signout', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    });
                    
                    if (response.ok) {
                      // Redirect to login page
                      window.location.href = '/login';
                    } else {
                      console.error('Failed to sign out');
                    }
                  } catch (error) {
                    console.error('Error signing out:', error);
                  }
                }}
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
