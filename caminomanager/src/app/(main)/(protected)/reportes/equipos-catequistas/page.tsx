"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ReportTable } from "@/components/reports/ReportTable";

interface CatechistTeamData {
  team_id: number;
  responsible_name: string;
  parish_name: string;
  community_number: string;
  parish_llevan: string;
  diocese_name: string;
}

type ParishFilter = "all" | "with_parish" | "without_parish";

export default function CatechistTeamsReport() {
  const [data, setData] = useState<CatechistTeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ParishFilter>("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Consulta para obtener equipos de catequistas (team_type_id = 3)
      // Excluir el equipo nacional (community_id IS NULL)
      const { data: teamsData, error } = await supabase
        .from("teams")
        .select(
          `
          id,
          community:communities!community_id(
            number,
            parish:parishes(
              name,
              diocese:dioceses(name, type),
              city:cities(name)
            )
          ),
          belongs(
            is_responsible_for_the_team,
            person:people(person_name)
          )
        `
        )
        .eq("team_type_id", 3)
        .not("community_id", "is", null);

      if (error) {
        console.error("Error fetching catechist teams:", error);
        return;
      }

      // Obtener las parroquias que lleva cada equipo
      const teamIds = teamsData?.map((t) => t.id) || [];
      let parishTeamsMap: Record<number, string[]> = {};

      if (teamIds.length > 0) {
        const { data: parishTeamsData, error: ptError } = await supabase
          .from("parish_teams")
          .select("team_id, parish:parishes(name)")
          .in("team_id", teamIds);

        if (ptError) {
          console.error("Error fetching parish_teams:", ptError);
        } else if (parishTeamsData) {
          for (const pt of parishTeamsData) {
            const parishName = (pt.parish as any)?.name || "";
            if (!parishTeamsMap[pt.team_id]) {
              parishTeamsMap[pt.team_id] = [];
            }
            if (parishName) {
              parishTeamsMap[pt.team_id].push(parishName);
            }
          }
        }
      }

      // Procesar los datos: duplicar filas si un equipo lleva más de una parroquia
      const processedData: CatechistTeamData[] = [];

      for (const team of teamsData || []) {
        const community = team.community as any;
        const parish = community?.parish;
        const diocese = parish?.diocese;

        const responsible = team.belongs?.find(
          (b: any) => b.is_responsible_for_the_team
        );

        const dioceseLabel = diocese
          ? `${diocese.type === "archdiocese" ? "Arquidiócesis" : "Diócesis"} de ${diocese.name}`
          : "N/A";

        const baseRow = {
          team_id: team.id,
          responsible_name:
            (responsible as any)?.person?.person_name || "Sin asignar",
          parish_name: parish?.name || "N/A",
          community_number: community?.number || "N/A",
          diocese_name: dioceseLabel,
        };

        const parishes = parishTeamsMap[team.id];
        if (parishes && parishes.length > 0) {
          for (const pName of parishes) {
            processedData.push({ ...baseRow, parish_llevan: pName });
          }
        } else {
          processedData.push({ ...baseRow, parish_llevan: "" });
        }
      }

      setData(processedData);
    } catch (error) {
      console.error("Error in fetchData:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter((row) => {
    if (filter === "with_parish") return row.parish_llevan !== "";
    if (filter === "without_parish") return row.parish_llevan === "";
    return true;
  });

  const columns = [
    {
      key: "responsible_name",
      label: "Responsable",
    },
    {
      key: "parish_name",
      label: "Parroquia",
    },
    {
      key: "community_number",
      label: "Comunidad No",
    },
    {
      key: "parish_llevan",
      label: "Parroquia que Lleva",
    },
    {
      key: "diocese_name",
      label: "Arquidiócesis",
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center gap-3 px-4">
        <label
          htmlFor="parish-filter"
          className="text-sm font-medium text-gray-700"
        >
          Filtrar por parroquia que lleva:
        </label>
        <select
          id="parish-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as ParishFilter)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">Todos</option>
          <option value="with_parish">Solo equipos que llevan parroquia</option>
          <option value="without_parish">
            Solo equipos que NO llevan parroquia
          </option>
        </select>
      </div>
      <ReportTable
        title="Equipos de Catequistas"
        description="Reporte de todos los equipos de catequistas con sus comunidades asignadas y parroquias que llevan"
        columns={columns}
        data={filteredData}
        loading={loading}
        onRefresh={fetchData}
        exportFileName="equipos_catequistas"
      />
    </div>
  );
}
