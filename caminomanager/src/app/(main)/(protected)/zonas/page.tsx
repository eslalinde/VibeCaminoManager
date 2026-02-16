"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { cityZoneConfig } from '@/config/entities';

export default function ZonesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Zonas</h1>
      </div>
      <EntityPage config={cityZoneConfig} pageSize={10} />
    </div>
  );
}
