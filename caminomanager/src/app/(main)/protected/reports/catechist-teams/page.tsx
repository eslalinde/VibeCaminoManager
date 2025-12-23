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
      
      // Consulta directa para obtener equipos de catequistas
      const { data: teamsData, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          team_types(name),
          communities(
            number,
            parishes(
              name,
              cities(name)
            )
          ),
          belongs(
            is_responsible_for_the_team,
            people(person_name)
          )
        `)
        .eq('team_types.name', 'Catequistas');

      if (error) {
        console.error('Error fetching catechist teams:', error);
        return;
      }

      // Procesar los datos para el formato de la tabla
      const processedData: CatechistTeamData[] = teamsData
        ?.filter(team => {
          // Filtrar solo equipos de catequistas, excluir responsables
          return team.team_types?.name === 'Catequistas';
        })
        ?.map(team => {
          const community = team.communities;
          const parish = community?.parishes;
          const city = parish?.cities;
          
          // Encontrar el responsable del equipo
          const responsible = team.belongs?.find(belong => belong.is_responsible_for_the_team);
          
          // Remover " Comunidad X" o variaciones del nombre del equipo
          let teamName = team.name;
          // Remover patrones como " Comunidad 1", " Comunidad 2", etc.
          teamName = teamName.replace(/\s+Comunidad\s+\d+$/i, '');
          
          return {
            team_id: team.id,
            team_name: teamName,
            team_type: team.team_types?.name || 'N/A',
            community_number: community?.number || 'N/A',
            parish_name: parish?.name || 'N/A',
            city_name: city?.name || 'N/A',
            members_count: team.belongs?.length || 0,
            responsible_name: responsible?.people?.person_name || 'Sin asignar'
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
