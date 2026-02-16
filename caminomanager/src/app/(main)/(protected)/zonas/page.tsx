"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { cityZoneConfig } from '@/config/entities';

export default function ZonesPage() {
  return (
    <div className="container mx-auto">
      <EntityPage config={cityZoneConfig} pageSize={10} />
    </div>
  );
}
