'use client';

import { useRouter } from 'next/navigation';
import { EntityPage } from '@/components/crud/EntityPage';
import { parishConfig } from '@/config/entities';
import { routes } from '@/lib/routes';

export default function ParishesPage() {
  const router = useRouter();

  const handleRowClick = (parish: any) => {
    router.push(routes.parroquia(parish.id));
  };

  return (
    <div className="container mx-auto">
      <EntityPage
        config={parishConfig}
        pageSize={10}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
