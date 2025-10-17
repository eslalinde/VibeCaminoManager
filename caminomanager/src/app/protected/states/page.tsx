"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { stateConfig } from '@/config/entities';

export default function StatesPage() {
  return <EntityPage config={stateConfig} />;
} 