"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ReportTable } from "@/components/reports/ReportTable";

interface CommunitiesByParishData {
  parish_id: number;
  parish_name: string;
  diocese: string;
  city_name: string;
  communities_count: number;
  total_brothers: number;
  avg_brothers_per_community: number;
}

export default function CommunitiesByParishReport() {
  const [data, setData] = useState<CommunitiesByParishData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Consulta directa para obtener comunidades agrupadas por parroquia
      const { data: parishesData, error } = await supabase
        .from('parishes')
        .select(`
          id,
          name,
          diocese,
          cities(name),
          communities(
            id,
            number,
            actual_brothers
          )
        `)
        .order('name');

      if (error) {
        console.error('Error fetching parishes data:', error);
        return;
      }

      // Procesar los datos para agrupar por parroquia
      const processedData: CommunitiesByParishData[] = parishesData?.map(parish => {
        const communities = parish.communities || [];
        const totalBrothers = communities.reduce((sum, comm) => sum + (comm.actual_brothers || 0), 0);
        const avgBrothers = communities.length > 0 ? Math.round(totalBrothers / communities.length * 100) / 100 : 0;
        
        return {
          parish_id: parish.id,
          parish_name: parish.name,
          diocese: parish.diocese || 'No especificado',
          city_name: (Array.isArray(parish.cities) ? parish.cities[0] : parish.cities)?.name || 'N/A',
          communities_count: communities.length,
          total_brothers: totalBrothers,
          avg_brothers_per_community: avgBrothers
        };
      }).filter(parish => parish.communities_count > 0) || []; // Solo parroquias con comunidades

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
      key: 'parish_name',
      label: 'Parroquia',
    },
    {
      key: 'diocese',
      label: 'Diócesis',
    },
    {
      key: 'city_name',
      label: 'Ciudad',
    },
    {
      key: 'communities_count',
      label: 'Comunidades',
    },
    {
      key: 'total_brothers',
      label: 'Total Hermanos',
    },
    {
      key: 'avg_brothers_per_community',
      label: 'Promedio por Comunidad',
    },
  ];

  return (
    <ReportTable
      title="Comunidades por Parroquia"
      description="Reporte de comunidades agrupadas por parroquia con estadísticas de hermanos"
      columns={columns}
      data={data}
      loading={loading}
      onRefresh={fetchData}
      exportFileName="comunidades_por_parroquia"
    />
  );
}
