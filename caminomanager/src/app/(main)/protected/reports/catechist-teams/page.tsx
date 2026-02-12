"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ReportTable } from "@/components/reports/ReportTable";

interface CatechistTeamData {
  team_id: number;
  team_name: string;
  team_type: string;
  community_number: string;
  parish_name: string;
  city_name: string;
  members_count: number;
  responsible_name: string;
}

export default function CatechistTeamsReport() {
  const [data, setData] = useState<CatechistTeamData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Consulta para obtener equipos de catequistas (team_type_id = 3)
      // Excluir el equipo nacional (community_id IS NULL)
      const { data: teamsData, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          team_type:team_types(name),
          community:communities!community_id(
            number,
            parish:parishes(
              name,
              city:cities(name)
            )
          ),
          belongs(
            is_responsible_for_the_team,
            person:people(person_name)
          )
        `)
        .eq('team_type_id', 3)
        .not('community_id', 'is', null);

      if (error) {
        console.error('Error fetching catechist teams:', error);
        return;
      }

      // Procesar los datos para el formato de la tabla
      const processedData: CatechistTeamData[] = teamsData
        ?.map(team => {
          const community = team.community as any;
          const parish = community?.parish;
          const city = parish?.city;

          // Encontrar el responsable del equipo
          const responsible = team.belongs?.find((b: any) => b.is_responsible_for_the_team);

          return {
            team_id: team.id,
            team_name: team.name,
            team_type: (team.team_type as any)?.name || 'N/A',
            community_number: community?.number || 'N/A',
            parish_name: parish?.name || 'N/A',
            city_name: city?.name || 'N/A',
            members_count: team.belongs?.length || 0,
            responsible_name: (responsible as any)?.person?.person_name || 'Sin asignar'
          };
        }) || [];

      setData(processedData);
    } catch (error) {
      console.error('Error in fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      key: 'team_name',
      label: 'Nombre del Equipo',
    },
    {
      key: 'community_number',
      label: 'Comunidad',
    },
    {
      key: 'parish_name',
      label: 'Parroquia',
    },
    {
      key: 'city_name',
      label: 'Ciudad',
    },
    {
      key: 'members_count',
      label: 'Miembros',
    },
    {
      key: 'responsible_name',
      label: 'Responsable',
    },
  ];

  return (
    <ReportTable
      title="Equipos de Catequistas"
      description="Reporte de todos los equipos de catequistas con sus comunidades asignadas y miembros"
      columns={columns}
      data={data}
      loading={loading}
      onRefresh={fetchData}
      exportFileName="equipos_catequistas"
    />
  );
}
