"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { stateConfig } from '@/config/entities';

export default function DepartamentosPage() {
  return (
    <div className="container mx-auto">
      <EntityPage config={stateConfig} pageSize={10} />
    </div>
  );
} 