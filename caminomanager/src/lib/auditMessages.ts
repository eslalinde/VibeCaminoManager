import { AuditLog } from '@/types/database';

// ── Table labels ──

const TABLE_LABELS: Record<string, string> = {
  communities: 'Comunidad',
  teams: 'Equipos',
  brothers: 'Hermanos',
  belongs: 'Miembros de equipo',
  community_step_log: 'Bitacora',
};

// ── Column labels (DB name → Spanish) ──

const COLUMN_LABELS: Record<string, string> = {
  // communities
  number: 'Numero',
  born_date: 'Fecha de nacimiento',
  parish_id: 'Parroquia',
  born_brothers: 'Hermanos de nacimiento',
  actual_brothers: 'Hermanos actuales',
  step_way_id: 'Paso del camino',
  last_step_way_date: 'Fecha ultimo paso',
  cathechist_team_id: 'Equipo de catequistas',
  // teams
  name: 'Nombre',
  team_type_id: 'Tipo de equipo',
  community_id: 'Comunidad',
  // brothers
  person_id: 'Persona',
  // belongs
  team_id: 'Equipo',
  is_responsible_for_the_team: 'Responsable del equipo',
  // community_step_log
  date_of_step: 'Fecha del paso',
  principal_catechist_name: 'Catequista principal',
  outcome: 'Resultado',
  notes: 'Notas',
};

function getColumnLabel(col: string): string {
  return COLUMN_LABELS[col] || col;
}

export function getTableLabel(table: string): string {
  return TABLE_LABELS[table] || table;
}

// ── Operation colors ──

export type AuditColor = 'green' | 'blue' | 'red';

function getOperationColor(op: string): AuditColor {
  switch (op) {
    case 'INSERT': return 'green';
    case 'UPDATE': return 'blue';
    case 'DELETE': return 'red';
    default: return 'blue';
  }
}

// ── Message generation ──

interface OperationMessage {
  INSERT: string;
  UPDATE: string;
  DELETE: string;
}

const TABLE_MESSAGES: Record<string, OperationMessage> = {
  communities: {
    INSERT: 'Creo una comunidad',
    UPDATE: 'Actualizo la comunidad',
    DELETE: 'Elimino la comunidad',
  },
  teams: {
    INSERT: 'Creo un equipo',
    UPDATE: 'Actualizo un equipo',
    DELETE: 'Elimino un equipo',
  },
  brothers: {
    INSERT: 'Agrego un hermano a la comunidad',
    UPDATE: 'Actualizo un hermano',
    DELETE: 'Elimino un hermano de la comunidad',
  },
  belongs: {
    INSERT: 'Agrego un miembro al equipo',
    UPDATE: 'Actualizo un miembro del equipo',
    DELETE: 'Elimino un miembro del equipo',
  },
  community_step_log: {
    INSERT: 'Registro una entrada en la bitacora',
    UPDATE: 'Actualizo una entrada de la bitacora',
    DELETE: 'Elimino una entrada de la bitacora',
  },
};

function getBaseMessage(table: string, op: string): string {
  const msgs = TABLE_MESSAGES[table];
  if (msgs && op in msgs) return msgs[op as keyof OperationMessage];
  return `${op} en ${getTableLabel(table)}`;
}

// Special-case: belongs UPDATE where is_responsible_for_the_team changed
function getBelongsUpdateMessage(entry: AuditLog): string | null {
  if (
    entry.table_name === 'belongs' &&
    entry.operation === 'UPDATE' &&
    entry.changed_columns?.includes('is_responsible_for_the_team')
  ) {
    const isNowResponsible = entry.new_values?.is_responsible_for_the_team;
    return isNowResponsible
      ? 'Asigno responsable del equipo'
      : 'Removio responsable del equipo';
  }
  return null;
}

// ── Change detail formatting ──

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '(vacio)';
  if (typeof val === 'boolean') return val ? 'Si' : 'No';
  return String(val);
}

export interface ChangeDetail {
  label: string;
  oldValue: string;
  newValue: string;
}

function getChangeDetails(entry: AuditLog): ChangeDetail[] {
  if (entry.operation !== 'UPDATE' || !entry.changed_columns) return [];
  return entry.changed_columns
    .filter(col => col !== 'updated_at' && col !== 'created_at')
    .map(col => ({
      label: getColumnLabel(col),
      oldValue: formatValue(entry.old_values?.[col]),
      newValue: formatValue(entry.new_values?.[col]),
    }));
}

// ── Relative time ──

export function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSec < 60) return 'hace un momento';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHrs < 24) return `hace ${diffHrs}h`;
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} dias`;

  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

// ── Public API ──

export interface FormattedAuditEntry {
  actorName: string;
  message: string;
  details: ChangeDetail[];
  color: AuditColor;
  relativeTime: string;
}

export function formatAuditEntry(entry: AuditLog): FormattedAuditEntry {
  const actorName = entry.user_profile?.full_name || 'Usuario desconocido';
  const specialMessage = getBelongsUpdateMessage(entry);
  const message = specialMessage || getBaseMessage(entry.table_name, entry.operation);
  const details = getChangeDetails(entry);
  const color = getOperationColor(entry.operation);
  const time = relativeTime(entry.created_at || new Date().toISOString());

  return { actorName, message, details, color, relativeTime: time };
}
