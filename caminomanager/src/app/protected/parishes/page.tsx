"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { parishConfig } from '@/config/entities';

export default function ParishesPage() {
  return <EntityPage config={parishConfig} />;
} 