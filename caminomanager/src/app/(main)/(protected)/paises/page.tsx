"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { countryConfig } from '@/config/entities';

export default function CountriesPage() {
  return (
    <div className="container mx-auto">
      <EntityPage config={countryConfig} pageSize={10} />
    </div>
  );
} 