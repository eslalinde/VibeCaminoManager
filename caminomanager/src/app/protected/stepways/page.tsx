"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { stepWayConfig } from '@/config/entities';

export default function EtapasDelCaminoPage() {
  return <EntityPage config={stepWayConfig} />;
} 