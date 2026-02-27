"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
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
    color: "bg-amber-500",
  },
  {
    title: "Parroquias",
    description: "Administrar parroquias y ver sus comunidades",
    href: routes.parroquias,
    icon: Church,
    color: "bg-blue-500",
  },
  {
    title: "Personas",
    description: "Gestionar personas, hermanos y catequistas",
    href: routes.personas,
    icon: Users,
    color: "bg-green-500",
  },
  {
    title: "Reportes",
    description: "Generar reportes de equipos, comunidades y líderes",
    href: routes.reportes,
    icon: BarChart3,
    color: "bg-purple-500",
  },
];

const secondaryAccess = [
  {
    title: "Diócesis",
    href: routes.diocesis,
    icon: Landmark,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    title: "Etapas del Camino",
    href: routes.etapas,
    icon: Footprints,
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    title: "Equipo Nacional",
    href: routes.equipoNacional,
    icon: UsersRound,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    title: "Países",
    href: routes.paises,
    icon: Globe,
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
];

export default function Home() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido a ComunidadCat
        </h1>
        <p className="text-lg text-gray-600">
          Selecciona una opción para comenzar a trabajar.
        </p>
      </div>

      {/* Primary quick access - large cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {quickAccess.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer h-full border-2 border-transparent hover:border-amber-200">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-4 rounded-xl ${item.color} text-white flex-shrink-0`}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-base text-gray-500 leading-relaxed">
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
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Otras secciones
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {secondaryAccess.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card className="p-4 hover:shadow-md transition-all cursor-pointer border hover:border-amber-200 group">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`p-2.5 rounded-lg ${item.bg} transition-colors`}
                    >
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center">
                      {item.title}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-400 transition-colors mx-auto mt-2" />
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
