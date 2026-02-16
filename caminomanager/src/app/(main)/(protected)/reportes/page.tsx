"use client";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { BarChart3, Users, UserCheck, GitBranch, Crown } from "lucide-react";
import { routes } from "@/lib/routes";

const reportTypes = [
  {
    title: "Equipos de Catequistas",
    description: "Reporte de equipos de catequistas con sus miembros y comunidades asignadas",
    href: routes.reporteCatequistas,
    icon: Users,
    color: "bg-blue-500",
  },
  {
    title: "Presbíteros",
    description: "Listado de presbíteros con sus parroquias asignadas",
    href: routes.reportePresbiteros,
    icon: UserCheck,
    color: "bg-purple-500",
  },
  {
    title: "Estado de Comunidades",
    description: "Matriz de comunidades por parroquia y etapa del camino neocatecumenal",
    href: routes.reporteEstadoPasos,
    icon: GitBranch,
    color: "bg-orange-500",
  },
  {
    title: "Líderes de Comunidades",
    description: "Reporte dinámico de comunidades con catequistas, presbíteros, itinerantes, seminaristas y monjas",
    href: routes.reporteLideres,
    icon: Crown,
    color: "bg-teal-500",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
      </div>
      
      <p className="text-gray-600 text-lg">
        Selecciona el tipo de reporte que deseas generar. Los reportes muestran información 
        consolidada de la base de datos con diferentes perspectivas de análisis.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Link key={report.href} href={report.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${report.color} text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {report.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
