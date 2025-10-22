"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { parishConfig } from '@/config/entities';

export default function ParishesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Parroquias</h1>
      </div>
      <EntityPage config={parishConfig} pageSize={10} />
    </div>
  );
} 