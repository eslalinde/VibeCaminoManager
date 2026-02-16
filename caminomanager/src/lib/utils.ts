import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normaliza texto removiendo acentos/tildes y convirtiendo a minúsculas.
 * Útil para búsquedas insensibles a acentos (ej: "medellin" encuentra "Medellín").
 */
export function normalizeText(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
