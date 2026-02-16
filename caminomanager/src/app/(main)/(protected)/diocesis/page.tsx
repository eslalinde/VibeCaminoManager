"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { dioceseConfig } from '@/config/entities';

export default function DiocesesPage() {
  return (
    <div className="container mx-auto">
      <EntityPage config={dioceseConfig} pageSize={10} />
    </div>
  );
}
