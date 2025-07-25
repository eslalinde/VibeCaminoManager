"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Home,
  Globe,
  MapPinned,
  Building2,
  Church,
  Users,
  Users2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/protected", icon: Home },
  { label: "Países", href: "/protected/countries", icon: Globe },
  { label: "Departamentos", href: "/protected/departments", icon: MapPinned },
  { label: "Ciudades", href: "/protected/cities", icon: Building2 },
  { label: "Parroquias", href: "/protected/parishes", icon: Church },
  { label: "Personas", href: "/protected/people", icon: Users },
  { label: "Comunidades", href: "/protected/communities", icon: Users2 },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen bg-white border-r transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <span className={cn("font-bold text-lg transition-all", collapsed && "hidden")}>CaminoManager</span>
        <button
          className="p-2 rounded hover:bg-gray-100"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Colapsar sidebar"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-all",
                collapsed && "justify-center gap-0"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className={cn("transition-all", collapsed && "hidden")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
} 