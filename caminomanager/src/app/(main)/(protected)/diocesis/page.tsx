"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { dioceseConfig } from '@/config/entities';

export default function DiocesesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Diócesis</h1>
      </div>
      <EntityPage config={dioceseConfig} pageSize={10} />
    </div>
  );
}
