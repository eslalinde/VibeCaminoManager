// Tipos base para todas las entidades
export interface BaseEntity {
  id?: number;
  created_at?: string;
  updated_at?: string;
}

// Tipos específicos para cada entidad
export interface Country extends BaseEntity {
  name: string;
  code: string;
}

export interface State extends BaseEntity {
  name: string;
  country_id: number;
  country?: Country;
}

export interface City extends BaseEntity {
  name: string;
  country_id: number;
  state_id?: number;
  country?: Country;
  state?: State;
}

export interface Parish extends BaseEntity {
  name: string;
  diocese?: string;
  address?: string;
  phone?: string;
  email?: string;
  country_id: number;
  state_id?: number;
  city_id: number;
  country?: Country;
  state?: State;
  city?: City;
}

export interface StepWay extends BaseEntity {
  name: string;
  order_num?: number;
}

export interface TeamType extends BaseEntity {
  name: string;
  order_num?: number;
}

export interface Person extends BaseEntity {
  person_name: string;
  phone?: string;
  mobile?: string;
  email?: string;
  person_type_id?: number;
  gender_id?: number;
  spouse_id?: number;
  spouse?: Person;
}

export interface Community extends BaseEntity {
  number: string;
  born_date?: string;
  parish_id?: number;
  born_brothers?: number;
  actual_brothers?: number;
  step_way_id?: number;
  last_step_way_date?: string;
  cathechist_team_id?: number;
  // Relations
  parish?: Parish;
  step_way?: StepWay;
}

export interface Brother extends BaseEntity {
  person_id: number;
  community_id: number;
  person?: Person;
}

export interface Team extends BaseEntity {
  name: string;
  team_type_id: number;
  community_id: number;
  team_type?: TeamType;
}

export interface Belongs extends BaseEntity {
  person_id: number;
  community_id: number;
  team_id: number;
  is_responsible_for_the_team: boolean;
  person?: Person;
  team?: Team;
}

// Tipos para operaciones CRUD
export interface CrudOperation<T> {
  create: (data: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<T>;
  update: (id: number, data: Partial<T>) => Promise<T>;
  delete: (id: number) => Promise<void>;
  getById: (id: number) => Promise<T | null>;
  getAll: (params?: QueryParams) => Promise<{ data: T[]; count: number }>;
}

export interface QueryParams {
  search?: string;
  sort?: { field: string; asc: boolean };
  page?: number;
  pageSize?: number;
  filters?: Record<string, any>;
}

// Tipos para formularios
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea';
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  validation?: (value: any) => string | null;
}

export interface ForeignKeyConfig {
  foreignKey: string;
  tableName: string;
  displayField: string;
  alias?: string;
}

export interface EntityConfig<T> {
  tableName: string;
  displayName: string;
  fields: FormField[];
  searchFields: (keyof T)[];
  sortableFields: (keyof T)[];
  defaultSort: { field: keyof T; asc: boolean };
  foreignKeys?: ForeignKeyConfig[];
  renderValue?: (fieldName: string, value: any) => string;
} 