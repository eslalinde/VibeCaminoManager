"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { stepWayConfig } from '@/config/entities';

export default function EtapasDelCaminoPage() {
  return (
    <div className="container mx-auto">
      <EntityPage config={stepWayConfig} pageSize={10} />
    </div>
  );
} 