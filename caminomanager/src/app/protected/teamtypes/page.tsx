"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { teamTypeConfig } from '@/config/entities';

export default function TeamTypesPage() {
  return <EntityPage config={teamTypeConfig} />;
} 