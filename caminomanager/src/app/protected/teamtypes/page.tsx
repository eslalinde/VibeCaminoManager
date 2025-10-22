"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { teamTypeConfig } from '@/config/entities';

export default function TeamTypesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Tipos de Equipo</h1>
      </div>
      <EntityPage config={teamTypeConfig} pageSize={10} />
    </div>
  );
} 