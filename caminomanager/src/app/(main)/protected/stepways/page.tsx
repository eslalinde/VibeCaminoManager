"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { stepWayConfig } from '@/config/entities';

export default function EtapasDelCaminoPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Etapas del Camino</h1>
      </div>
      <EntityPage config={stepWayConfig} pageSize={10} />
    </div>
  );
} 