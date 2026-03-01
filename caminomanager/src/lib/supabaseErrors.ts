/**
 * Translates Supabase/PostgreSQL error objects into user-friendly Spanish messages.
 *
 * Usage:
 *   import { friendlyError } from '@/lib/supabaseErrors';
 *   catch (err) { setError(friendlyError(err)); }
 */

const TABLE_LABELS: Record<string, string> = {
  belongs: 'miembros de equipo',
  brothers: 'hermanos',
  communities: 'comunidades',
  community_step_log: 'bitácora de comunidad',
  parishes: 'parroquias',
  parish_catechesis: 'catequesis parroquial',
  parish_teams: 'equipos parroquiales',
  people: 'personas',
  priests: 'sacerdotes',
  teams: 'equipos',
  countries: 'países',
  states: 'departamentos',
  cities: 'ciudades',
  city_zones: 'zonas',
  dioceses: 'diócesis',
  step_ways: 'etapas',
  team_types: 'tipos de equipo',
  profiles: 'perfiles',
  audit_log: 'registro de auditoría',
};

function getTableLabel(msg: string): string {
  const match = msg.match(/for table "(\w+)"/);
  if (match) {
    return TABLE_LABELS[match[1]] || match[1];
  }
  return '';
}

/** Unique-constraint friendly messages keyed by constraint name fragment */
const UNIQUE_MESSAGES: Record<string, string> = {
  countries_name_unique: 'Ya existe un país con ese nombre.',
  states_name_country_unique: 'Ya existe un departamento con ese nombre en el país seleccionado.',
  cities_name_country_state_unique: 'Ya existe una ciudad con ese nombre en el país y departamento seleccionados.',
  city_zones_name_city_unique: 'Ya existe una zona con ese nombre en la ciudad seleccionada.',
  dioceses_name_key: 'Ya existe una diócesis con ese nombre.',
  parishes_name_city_unique: 'Ya existe una parroquia con ese nombre en la ciudad seleccionada.',
  team_types_name_unique: 'Ya existe un tipo de equipo con ese nombre.',
  step_ways_name_unique: 'Ya existe una etapa con ese nombre.',
  communities_number_parish_unique: 'Ya existe una comunidad con ese número en la parroquia seleccionada.',
};

/**
 * Convert any Supabase / PostgreSQL error into a human-readable Spanish string.
 *
 * Handles:
 *  - RLS violations  (code 42501 or message pattern)
 *  - Unique constraints (23505)
 *  - FK violations    (23503)
 *  - Check constraints (23514)
 *  - Permission denied from custom RAISE EXCEPTION
 *  - Generic fallback
 */
export function friendlyError(error: unknown, fallback?: string): string {
  if (!error) return fallback || 'Error inesperado. Por favor, inténtalo de nuevo.';

  const err = error as Record<string, any>;
  const code: string = err.code ?? '';
  const message: string = err.message ?? (typeof error === 'string' ? error : '');
  const detail: string = err.detail ?? '';
  const constraint: string = err.constraint ?? '';

  // ── RLS / Permissions ────────────────────────────────────
  if (
    code === '42501' ||
    message.includes('row-level security policy') ||
    message.includes('permission denied')
  ) {
    const table = getTableLabel(message);
    return table
      ? `No tienes permisos suficientes para modificar ${table}. Contacta a un administrador si crees que esto es un error.`
      : 'No tienes permisos suficientes para realizar esta operación. Contacta a un administrador si crees que esto es un error.';
  }

  // ── Custom RAISE EXCEPTION from functions (e.g. merge_communities) ──
  if (message.includes('Permiso denegado')) {
    return message;
  }

  // ── Unique constraint (23505) ────────────────────────────
  if (code === '23505') {
    for (const [key, msg] of Object.entries(UNIQUE_MESSAGES)) {
      if (constraint.includes(key)) return msg;
    }
    if (detail.includes('name') && detail.includes('country_id') && detail.includes('state_id')) {
      return 'Ya existe una ciudad con ese nombre en el país y departamento seleccionados.';
    }
    if (detail.includes('name') && detail.includes('country_id')) {
      return 'Ya existe un departamento con ese nombre en el país seleccionado.';
    }
    if (detail.includes('name')) {
      return 'Ya existe un registro con ese nombre.';
    }
    return 'Ya existe un registro con esos datos.';
  }

  // ── FK violation (23503) ─────────────────────────────────
  if (code === '23503') {
    return 'No se puede realizar esta operación porque hay datos relacionados que lo impiden.';
  }

  // ── Check constraint (23514) ─────────────────────────────
  if (code === '23514') {
    return 'Los datos no cumplen con las restricciones de validación.';
  }

  // ── Table does not exist ─────────────────────────────────
  if (code === '42P01') {
    return 'La tabla no existe.';
  }

  // ── Conflict ─────────────────────────────────────────────
  if (code === '409') {
    return 'Conflicto: Los datos enviados ya existen o violan alguna restricción.';
  }

  // ── Fallback ─────────────────────────────────────────────
  return fallback || message || 'Error inesperado. Por favor, inténtalo de nuevo.';
}
