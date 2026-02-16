'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EntityPage } from '@/components/crud';
import { communityConfig } from '@/config/entities';
import { routes } from '@/lib/routes';

export default function CommunitiesPage() {
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRowClick = (community: any) => {
    router.push(routes.comunidad(community.id));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Comunidades</h1>
      </div>
      
      <EntityPage 
        key={refreshTrigger}
        config={communityConfig} 
        pageSize={10}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
