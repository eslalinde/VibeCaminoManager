"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { stepWayConfig } from '@/config/entities';

export default function StepWaysPage() {
  return <EntityPage config={stepWayConfig} />;
} 