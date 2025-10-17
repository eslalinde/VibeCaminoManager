"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { countryConfig } from '@/config/entities';

export default function CountriesPage() {
  return <EntityPage config={countryConfig} />;
} 