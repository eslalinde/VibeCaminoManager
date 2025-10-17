"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { cityConfig } from '@/config/entities';

export default function CitiesPage() {
  return <EntityPage config={cityConfig} />;
} 