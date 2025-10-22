"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { stateConfig } from '@/config/entities';

export default function DepartamentosPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Departamentos</h1>
      </div>
      <EntityPage config={stateConfig} pageSize={10} />
    </div>
  );
} 