"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Printer } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";

interface StepWay {
  id: number;
  name: string;
  order_num: number | null;
}

interface CommunityRow {
  id: number;
  number: string;
  parish_id: number;
  parish_name: string;
  step_way_id: number | null;
  step_way_name: string | null;
}

export default function ReporteEstadoPasos() {
  const [communities, setCommunities] = useState<CommunityRow[]>([]);
  const [stepWays, setStepWays] = useState<StepWay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const [commRes, stepsRes] = await Promise.all([
        supabase
          .from("communities")
          .select(
            `
            id,
            number,
            parish_id,
            step_way_id,
            parish:parishes(name),
            step_way:step_ways(name)
          `
          )
          .order("number"),
        supabase
          .from("step_ways")
          .select("id, name, order_num")
          .order("order_num", { ascending: true }),
      ]);

      if (commRes.error) {
        console.error("Error fetching communities:", commRes.error);
        return;
      }
      if (stepsRes.error) {
        console.error("Error fetching step_ways:", stepsRes.error);
        return;
      }

      const rows: CommunityRow[] = (commRes.data || []).map((c: any) => ({
        id: c.id,
        number: c.number,
        parish_id: c.parish_id,
        parish_name: (c.parish as any)?.name || "Sin Parroquia",
        step_way_id: c.step_way_id,
        step_way_name: (c.step_way as any)?.name || null,
      }));

      setCommunities(rows);
      setStepWays(stepsRes.data || []);
    } catch (err) {
      console.error("Error in fetchData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Build the matrix data
  const { parishes, matrix, totalsByStep, totalsByParish, grandTotal } =
    useMemo(() => {
      // Unique parishes sorted alphabetically
      const parishMap = new Map<number, string>();
      communities.forEach((c) => {
        if (c.parish_id && !parishMap.has(c.parish_id)) {
          parishMap.set(c.parish_id, c.parish_name);
        }
      });
      const parishes = Array.from(parishMap.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name, "es-CO"));

      // matrix[parishId][stepWayId] = community numbers[]
      const matrix: Record<number, Record<number, string[]>> = {};
      parishes.forEach((p) => {
        matrix[p.id] = {};
        stepWays.forEach((s) => {
          matrix[p.id][s.id] = [];
        });
      });

      communities.forEach((c) => {
        if (c.parish_id && c.step_way_id && matrix[c.parish_id]?.[c.step_way_id]) {
          matrix[c.parish_id][c.step_way_id].push(c.number);
        }
      });

      // Sort community numbers inside each cell numerically
      Object.values(matrix).forEach((stepMap) => {
        Object.values(stepMap).forEach((arr) => {
          arr.sort((a, b) => {
            const na = parseInt(a, 10);
            const nb = parseInt(b, 10);
            if (!isNaN(na) && !isNaN(nb)) return na - nb;
            return a.localeCompare(b, "es-CO");
          });
        });
      });

      // Totals
      const totalsByStep: Record<number, number> = {};
      stepWays.forEach((s) => {
        totalsByStep[s.id] = 0;
        parishes.forEach((p) => {
          totalsByStep[s.id] += matrix[p.id][s.id].length;
        });
      });

      const totalsByParish: Record<number, number> = {};
      parishes.forEach((p) => {
        totalsByParish[p.id] = 0;
        stepWays.forEach((s) => {
          totalsByParish[p.id] += matrix[p.id][s.id].length;
        });
      });

      const grandTotal = Object.values(totalsByParish).reduce(
        (sum, v) => sum + v,
        0
      );

      return { parishes, matrix, totalsByStep, totalsByParish, grandTotal };
    }, [communities, stepWays]);

  const toOrdinal = (num: string) => `${num}ª`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link href={routes.reportes}>
            <Button variant="outline" size="1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Estado de Comunidades
            </h1>
            <p className="text-gray-600">
              Matriz de comunidades distribuidas por parroquia y etapa del camino
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block print:mb-4">
        <h1 className="text-xl font-bold text-center">
          Estado de Pasos por Parroquia
        </h1>
        <p className="text-sm text-center text-gray-600">
          Generado el {new Date().toLocaleDateString("es-CO")}
        </p>
      </div>

      {/* Matrix Table */}
      <Card className="p-4 print:shadow-none print:border-none print:p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Cargando datos...</span>
          </div>
        ) : parishes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay datos disponibles</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm print:text-xs">
              <thead>
                <tr className="bg-gray-100 print:bg-gray-200">
                  <th className="sticky left-0 z-10 bg-gray-100 print:bg-gray-200 border border-gray-300 px-3 py-2 text-left font-semibold text-gray-900 min-w-[180px] print:min-w-0">
                    Parroquia
                  </th>
                  {stepWays.map((step) => (
                    <th
                      key={step.id}
                      className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900 w-24 min-w-[96px] print:w-auto print:min-w-0"
                    >
                      {step.name}
                    </th>
                  ))}
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold text-gray-900 bg-blue-50 print:bg-blue-100 w-20 min-w-[80px] print:w-auto print:min-w-0">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {parishes.map((parish, idx) => (
                  <tr
                    key={parish.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="sticky left-0 z-10 border border-gray-300 px-3 py-1.5 font-medium text-gray-900 bg-inherit">
                      {parish.name}
                    </td>
                    {stepWays.map((step) => {
                      const nums = matrix[parish.id][step.id];
                      return (
                        <td
                          key={step.id}
                          className="border border-gray-300 px-2 py-1.5 text-center text-gray-700 break-words"
                        >
                          {nums.length > 0
                            ? nums.map(toOrdinal).join(", ")
                            : ""}
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold text-blue-800 bg-blue-50 print:bg-blue-100">
                      {totalsByParish[parish.id]}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 print:bg-gray-200 font-bold">
                  <td className="sticky left-0 z-10 bg-gray-100 print:bg-gray-200 border border-gray-300 px-3 py-2 font-bold text-gray-900">
                    Total por Paso
                  </td>
                  {stepWays.map((step) => (
                    <td
                      key={step.id}
                      className="border border-gray-300 px-2 py-2 text-center text-gray-900"
                    >
                      {totalsByStep[step.id]}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-2 py-2 text-center font-bold text-white bg-blue-600 print:bg-blue-800 print:text-white">
                    {grandTotal}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {parishes.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center print:hidden">
            {parishes.length} parroquias &middot; {grandTotal} comunidades
          </div>
        )}
      </Card>
    </div>
  );
}
