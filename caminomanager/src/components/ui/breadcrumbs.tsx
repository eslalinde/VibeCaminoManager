"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { routes } from "@/lib/routes";

const routeLabels: Record<string, string> = {
  "/": "Inicio",
  "/paises": "Países",
  "/departamentos": "Departamentos",
  "/ciudades": "Ciudades",
  "/zonas": "Zonas",
  "/diocesis": "Diócesis",
  "/parroquias": "Parroquias",
  "/etapas": "Etapas del Camino",
  "/tipos-equipo": "Tipos de Equipo",
  "/personas": "Personas",
  "/comunidades": "Comunidades",
  "/equipo-nacional": "Equipo Nacional",
  "/reportes": "Reportes",
  "/reportes/equipos-catequistas": "Equipos de Catequistas",
  "/reportes/presbiteros": "Presbíteros",
  "/reportes/estado-pasos": "Estado de Comunidades",
  "/reportes/lideres-comunidades": "Líderes de Comunidades",
  "/cuenta": "Mi Cuenta",
  "/admin": "Administración",
};

function getBreadcrumbs(pathname: string) {
  if (pathname === "/") return [];

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;

    // Check if it's a dynamic segment (numeric ID)
    if (/^\d+$/.test(segment)) {
      crumbs.push({ label: `Detalle`, href: currentPath });
    } else {
      const label = routeLabels[currentPath] || segment;
      crumbs.push({ label, href: currentPath });
    }
  }

  return crumbs;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
      <Link
        href={routes.home}
        className="flex items-center gap-1 hover:text-amber-700 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Inicio</span>
      </Link>

      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="w-4 h-4 text-gray-300" />
            {isLast ? (
              <span className="font-medium text-gray-800">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-amber-700 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
