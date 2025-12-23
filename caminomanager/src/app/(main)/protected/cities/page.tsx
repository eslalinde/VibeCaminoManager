"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { cityConfig } from '@/config/entities';

export default function CitiesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Ciudades</h1>
      </div>
      <EntityPage config={cityConfig} pageSize={10} />
    </div>
  );
} 