"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { teamTypeConfig } from '@/config/entities';

export default function TeamTypesPage() {
  return (
    <div className="container mx-auto">
      <EntityPage config={teamTypeConfig} pageSize={10} />
    </div>
  );
} 