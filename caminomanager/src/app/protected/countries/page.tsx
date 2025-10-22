"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { countryConfig } from '@/config/entities';

export default function CountriesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Países</h1>
      </div>
      <EntityPage config={countryConfig} pageSize={10} />
    </div>
  );
} 