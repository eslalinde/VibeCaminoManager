export interface CarismaOption {
  value: number;
  label: string;
}

export const CARISMA_OPTIONS: CarismaOption[] = [
  { value: 1, label: 'Casado' },
  { value: 2, label: 'Soltero' },
  { value: 3, label: 'Presbítero' },
  { value: 4, label: 'Seminarista' },
  { value: 5, label: 'Diácono' },
  { value: 6, label: 'Monja' },
  { value: 7, label: 'Viudo' },
  { value: 8, label: 'Itinerante' },
];

/** Person types that cannot be married (should not be merged with spouse) */
export const NON_MARRIAGE_TYPE_IDS = [3, 4, 5, 6, 8];

export function getCarismaLabel(personTypeId?: number): string {
  if (!personTypeId) return '';
  return CARISMA_OPTIONS.find(opt => opt.value === personTypeId)?.label || '';
}

/** Badge color classes by carisma label, for use in UI components */
export const CARISMA_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  'Presbítero': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'Itinerante': { bg: 'bg-teal-100', text: 'text-teal-800' },
  'Seminarista': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'Diácono': { bg: 'bg-orange-100', text: 'text-orange-800' },
  'Monja': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  'Viudo': { bg: 'bg-slate-100', text: 'text-slate-800' },
  'Soltero': { bg: 'bg-gray-100', text: 'text-gray-800' },
  'Casado': { bg: 'bg-pink-100', text: 'text-pink-800' },
};

/** Order for grouping brothers by carisma in BrothersList (lower = first) */
export const CARISMA_GROUP_ORDER: Record<string, number> = {
  'Casado': 0,
  'Presbítero': 1,
  'Itinerante': 2,
  'Diácono': 3,
  'Seminarista': 4,
  'Monja': 5,
  'Viudo': 6,
  'Soltero': 7,
  '': 8,
};
