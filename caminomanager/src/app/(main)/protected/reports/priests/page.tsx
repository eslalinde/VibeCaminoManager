"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ReportTable } from "@/components/reports/ReportTable";

interface PriestData {
  priest_id: number;
  priest_name: string;
  phone: string;
  mobile: string;
  email: string;
  is_parish_priest: boolean;
  parish_name: string;
  diocese: string;
  city_name: string;
  communities_count: number;
}

export default function PriestsReport() {
  const [data, setData] = useState<PriestData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Primero obtener los presbíteros básicos
      const { data: priestsData, error: priestsError } = await supabase
        .from('priests')
        .select(`
          id,
          is_parish_priest,
          person_id,
          parish_id
        `);

      if (priestsError) {
        console.error('Error fetching priests basic data:', priestsError);
        return;
      }

      if (!priestsData || priestsData.length === 0) {
        console.log('No priests found in database');
        setData([]);
        return;
      }

      // Obtener información de personas
      const personIds = priestsData.map(p => p.person_id).filter(Boolean);
      const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select('id, person_name, phone, mobile, email')
        .in('id', personIds);

      if (peopleError) {
        console.error('Error fetching people data:', peopleError);
        return;
      }

      // Obtener información de parroquias
      const parishIds = priestsData.map(p => p.parish_id).filter(Boolean);
      const { data: parishesData, error: parishesError } = await supabase
        .from('parishes')
        .select(`
          id,
          name,
          diocese:dioceses(name),
          city_id
        `)
        .in('id', parishIds);

      if (parishesError) {
        console.error('Error fetching parishes data:', parishesError);
        return;
      }

      // Obtener información de ciudades
      const cityIds = parishesData?.map(p => p.city_id).filter(Boolean) || [];
      const { data: citiesData, error: citiesError } = await supabase
        .from('cities')
        .select('id, name')
        .in('id', cityIds);

      if (citiesError) {
        console.error('Error fetching cities data:', citiesError);
        return;
      }

      // Obtener conteo de comunidades por parroquia
      const { data: communitiesData, error: communitiesError } = await supabase
        .from('communities')
        .select('parish_id')
        .in('parish_id', parishIds);

      if (communitiesError) {
        console.error('Error fetching communities data:', communitiesError);
        return;
      }

      // Procesar los datos para el formato de la tabla
      const processedData: PriestData[] = priestsData.map(priest => {
        const person = peopleData?.find(p => p.id === priest.person_id);
        const parish = parishesData?.find(p => p.id === priest.parish_id);
        const city = citiesData?.find(c => c.id === parish?.city_id);
        const communitiesCount = communitiesData?.filter(c => c.parish_id === priest.parish_id).length || 0;
        
        return {
          priest_id: priest.id,
          priest_name: person?.person_name || 'N/A',
          phone: person?.phone || '-',
          mobile: person?.mobile || '-',
          email: person?.email || '-',
          is_parish_priest: priest.is_parish_priest,
          parish_name: parish?.name || 'Sin parroquia asignada',
          diocese: (parish?.diocese as any)?.name || 'No especificado',
          city_name: city?.name || 'N/A',
          communities_count: communitiesCount
        };
      });

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
      key: 'priest_name',
      label: 'Nombre del Presbítero',
    },
    {
      key: 'is_parish_priest',
      label: 'Párroco',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Sí' : 'No'}
        </span>
      ),
    },
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
      render: (value: number) => (
        <span className="font-medium text-purple-600">{value}</span>
      ),
    },
    {
      key: 'phone',
      label: 'Teléfono',
    },
    {
      key: 'mobile',
      label: 'Móvil',
    },
    {
      key: 'email',
      label: 'Email',
      render: (value: string) => (
        <span className="text-sm text-blue-600">{value}</span>
      ),
    },
  ];

  return (
    <ReportTable
      title="Presbíteros"
      description="Reporte de todos los presbíteros con sus parroquias asignadas y comunidades a cargo"
      columns={columns}
      data={data}
      loading={loading}
      onRefresh={fetchData}
      exportFileName="presbiteros"
    />
  );
}
