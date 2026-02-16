"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Globe,
  MapPinned,
  Building2,
  Layers,
  Cross,
  Church,
  Users,
  Users2,
  ChevronLeft,
  Route,
  BarChart3,
  Shield,
} from "lucide-react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import "@radix-ui/themes/styles.css";
import { routes } from "@/lib/routes";

const navItems = [
  { label: "Países", href: routes.paises, icon: Globe },
  { label: "Departamentos", href: routes.departamentos, icon: MapPinned },
  { label: "Ciudades", href: routes.ciudades, icon: Building2 },
  { label: "Zonas", href: routes.zonas, icon: Layers },
  { label: "Diócesis", href: routes.diocesis, icon: Cross },
  { label: "Parroquias", href: routes.parroquias, icon: Church },
  { label: "Etapas del Camino", href: routes.etapas, icon: Route },
  { label: "Tipos de Equipo", href: routes.tiposEquipo, icon: Users2 },
  { label: "Personas", href: routes.personas, icon: Users },
  { label: "Comunidades", href: routes.comunidades, icon: Users2 },
  { label: "Equipo Nacional", href: routes.equipoNacional, icon: Shield },
  { label: "Reportes", href: routes.reportes, icon: BarChart3 },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen bg-white border-r transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b bg-gradient-to-r from-amber-50 to-orange-50">
        <div
          className={cn("flex items-center gap-2 transition-all", collapsed && "justify-center w-full cursor-pointer")}
          onClick={collapsed ? () => setCollapsed(false) : undefined}
        >
          <Image
            src="/logo.png"
            alt="ComunidadCat Logo"
            width={36}
            height={36}
            className="rounded-full flex-shrink-0"
          />
          <span className={cn("font-bold text-lg text-gray-800 transition-all", collapsed && "hidden")}>ComunidadCat</span>
        </div>
        <button
          className={cn("p-2 rounded hover:bg-amber-100 transition-colors", collapsed && "hidden")}
          onClick={() => setCollapsed(true)}
          aria-label="Colapsar sidebar"
        >
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        <NavigationMenu.Root orientation="vertical" className="w-full">
          <NavigationMenu.List className="flex flex-col gap-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <NavigationMenu.Item key={item.href}>
                  <NavigationMenu.Link asChild>
                    <Link href={item.href} className={cn(
                      "flex items-center gap-3 px-3 py-2 transition-all rounded-lg text-sm font-medium",
                      collapsed && "justify-center gap-0 px-2",
                      isActive
                        ? "bg-amber-100 text-amber-800"
                        : "text-gray-600 hover:bg-amber-50 hover:text-amber-700"
                    )}>
                      <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-amber-600")} />
                      <span className={cn("transition-all", collapsed && "hidden")}>{item.label}</span>
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              );
            })}
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </nav>
    </aside>
  );
}
