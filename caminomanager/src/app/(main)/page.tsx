"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  Users,
  Church,
  Users2,
  BarChart3,
  Globe,
  Landmark,
  Footprints,
  UsersRound,
  ChevronRight,
} from "lucide-react";
import { routes } from "@/lib/routes";

const quickAccess = [
  {
    title: "Comunidades",
    description: "Ver y gestionar las comunidades del Camino Neocatecumenal",
    href: routes.comunidades,
    icon: Users2,
    iconColor: "text-orange-600",
    bg: "bg-orange-50",
    border: "hover:border-orange-300",
  },
  {
    title: "Parroquias",
    description: "Administrar parroquias y ver sus comunidades",
    href: routes.parroquias,
    icon: Church,
    iconColor: "text-blue-600",
    bg: "bg-blue-50",
    border: "hover:border-blue-300",
  },
  {
    title: "Personas",
    description: "Gestionar personas, hermanos y catequistas",
    href: routes.personas,
    icon: Users,
    iconColor: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "hover:border-emerald-300",
  },
  {
    title: "Reportes",
    description: "Generar reportes de equipos, comunidades y líderes",
    href: routes.reportes,
    icon: BarChart3,
    iconColor: "text-red-600",
    bg: "bg-red-50",
    border: "hover:border-red-300",
  },
];

const secondaryAccess = [
  {
    title: "Diócesis",
    href: routes.diocesis,
    icon: Landmark,
    iconColor: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    title: "Etapas del Camino",
    href: routes.etapas,
    icon: Footprints,
    iconColor: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Equipo Nacional",
    href: routes.equipoNacional,
    icon: UsersRound,
    iconColor: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Países",
    href: routes.paises,
    icon: Globe,
    iconColor: "text-orange-600",
    bg: "bg-orange-50",
  },
];

export default function Home() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
          Bienvenido a <BrandLogo size="md" />
        </h1>
        <p className="text-gray-500 mt-1">
          Selecciona una opción para comenzar a trabajar.
        </p>
      </div>

      {/* Primary quick access - large cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickAccess.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className={`p-5 hover:shadow-md transition-all cursor-pointer h-full border border-gray-200 ${item.border}`}>
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl ${item.bg} flex-shrink-0`}
                  >
                    <Icon className={`w-7 h-7 ${item.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-0.5">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Secondary access - smaller cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Otras secciones
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {secondaryAccess.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card className="p-4 hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-gray-300 group">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`p-2.5 rounded-lg ${item.bg} transition-colors`}
                    >
                      <Icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center">
                      {item.title}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors mx-auto mt-2" />
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
