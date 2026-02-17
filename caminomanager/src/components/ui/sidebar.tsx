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
  ShieldCheck,
  Home,
} from "lucide-react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as Tooltip from "@radix-ui/react-tooltip";
import "@radix-ui/themes/styles.css";
import { routes } from "@/lib/routes";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { label: "Inicio", href: routes.home, icon: Home },
      { label: "Comunidades", href: routes.comunidades, icon: Users2 },
      { label: "Parroquias", href: routes.parroquias, icon: Church },
      { label: "Personas", href: routes.personas, icon: Users },
    ],
  },
  {
    title: "Organización",
    items: [
      { label: "Diócesis", href: routes.diocesis, icon: Cross },
      { label: "Equipo Nacional", href: routes.equipoNacional, icon: Shield },
      { label: "Etapas del Camino", href: routes.etapas, icon: Route },
      { label: "Tipos de Equipo", href: routes.tiposEquipo, icon: Users2 },
    ],
  },
  {
    title: "Ubicaciones",
    items: [
      { label: "Países", href: routes.paises, icon: Globe },
      { label: "Departamentos", href: routes.departamentos, icon: MapPinned },
      { label: "Ciudades", href: routes.ciudades, icon: Building2 },
      { label: "Zonas", href: routes.zonas, icon: Layers },
    ],
  },
  {
    title: "Reportes",
    items: [
      { label: "Reportes", href: routes.reportes, icon: BarChart3 },
    ],
  },
  {
    title: "Administración",
    items: [
      { label: "Usuarios", href: routes.admin, icon: ShieldCheck },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <Tooltip.Provider delayDuration={300}>
      <aside
        className={cn(
          "h-screen bg-white border-r transition-all duration-300 flex flex-col print-hidden",
          collapsed ? "w-[68px]" : "w-72"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b bg-gradient-to-r from-amber-50 to-orange-50">
          <div
            className={cn(
              "flex items-center gap-2 transition-all",
              collapsed && "justify-center w-full cursor-pointer"
            )}
            onClick={collapsed ? () => setCollapsed(false) : undefined}
          >
            <Image
              src="/logo.png"
              alt="ComunidadCat Logo"
              width={36}
              height={36}
              className="rounded-full flex-shrink-0"
            />
            <span
              className={cn(
                "font-bold text-lg text-gray-800 transition-all",
                collapsed && "hidden"
              )}
            >
              ComunidadCat
            </span>
          </div>
          <button
            className={cn(
              "p-2 rounded hover:bg-amber-100 transition-colors",
              collapsed && "hidden"
            )}
            onClick={() => setCollapsed(true)}
            aria-label="Colapsar sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <NavigationMenu.Root orientation="vertical" className="w-full">
            <NavigationMenu.List className="flex flex-col">
              {navGroups.map((group, groupIndex) => (
                <div key={group.title}>
                  {/* Group separator */}
                  {groupIndex > 0 && (
                    <div className={cn("mx-3 my-2 border-t border-gray-200")} />
                  )}

                  {/* Group title - only when expanded */}
                  {!collapsed && (
                    <div className="px-4 pt-2 pb-1">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {group.title}
                      </span>
                    </div>
                  )}

                  {/* Group items */}
                  <div className="flex flex-col gap-0.5 px-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === "/"
                          ? pathname === "/"
                          : pathname.startsWith(item.href);

                      const linkContent = (
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 transition-all rounded-lg font-medium",
                            collapsed
                              ? "justify-center gap-0 px-2"
                              : "text-base",
                            isActive
                              ? "bg-amber-100 text-amber-800"
                              : "text-gray-600 hover:bg-amber-50 hover:text-amber-700"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-6 h-6 flex-shrink-0",
                              isActive && "text-amber-600"
                            )}
                          />
                          <span
                            className={cn(
                              "transition-all",
                              collapsed && "hidden"
                            )}
                          >
                            {item.label}
                          </span>
                        </Link>
                      );

                      return (
                        <NavigationMenu.Item key={item.href}>
                          <NavigationMenu.Link asChild>
                            {collapsed ? (
                              <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                  {linkContent}
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                  <Tooltip.Content
                                    side="right"
                                    sideOffset={8}
                                    className="bg-gray-900 text-white text-sm font-medium px-3 py-1.5 rounded-md shadow-lg z-50"
                                  >
                                    {item.label}
                                    <Tooltip.Arrow className="fill-gray-900" />
                                  </Tooltip.Content>
                                </Tooltip.Portal>
                              </Tooltip.Root>
                            ) : (
                              linkContent
                            )}
                          </NavigationMenu.Link>
                        </NavigationMenu.Item>
                      );
                    })}
                  </div>
                </div>
              ))}
            </NavigationMenu.List>
          </NavigationMenu.Root>
        </nav>
      </aside>
    </Tooltip.Provider>
  );
}
