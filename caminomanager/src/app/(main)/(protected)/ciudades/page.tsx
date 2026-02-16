"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { cityConfig } from '@/config/entities';

export default function CitiesPage() {
  return (
    <div className="container mx-auto">
      <EntityPage config={cityConfig} pageSize={10} />
    </div>
  );
} 