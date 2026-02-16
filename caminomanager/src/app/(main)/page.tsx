"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Users,
  Church,
  Users2,
  BarChart3,
  Globe,
  Cross,
  Shield,
  Route,
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
    icon: Cross,
  },
  {
    title: "Etapas del Camino",
    href: routes.etapas,
    icon: Route,
  },
  {
    title: "Equipo Nacional",
    href: routes.equipoNacional,
    icon: Shield,
  },
  {
    title: "Países",
    href: routes.paises,
    icon: Globe,
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
                <Card className="p-4 hover:shadow-md transition-all cursor-pointer text-center border hover:border-amber-200">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {item.title}
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
