import { EntityConfig, FormField } from '@/types/database';
import { Country, State, City, Parish, StepWay, TeamType } from '@/types/database';

// Configuración para Países
export const countryConfig: EntityConfig<Country> = {
  tableName: 'countries',
  displayName: 'País',
  fields: [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      maxLength: 256,
      placeholder: 'Ingrese el nombre del país'
    },
    {
      name: 'code',
      label: 'Código',
      type: 'text',
      required: true,
      maxLength: 2,
      minLength: 2,
      placeholder: 'CO',
      validation: (value) => {
        if (value && value.length !== 2) {
          return 'El código debe tener exactamente 2 caracteres';
        }
        return null;
      }
    }
  ],
  searchFields: ['name', 'code'],
  sortableFields: ['name', 'code'],
  defaultSort: { field: 'name', asc: true }
};

// Configuración para Estados/Provincias
export const stateConfig: EntityConfig<State> = {
  tableName: 'states',
  displayName: 'Estado',
  fields: [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      maxLength: 256,
      placeholder: 'Ingrese el nombre del estado'
    },
    {
      name: 'country_id',
      label: 'País',
      type: 'select',
      required: true,
      options: [], // Se llenará dinámicamente
      placeholder: 'Seleccione un país'
    }
  ],
  searchFields: ['name'],
  sortableFields: ['name'],
  defaultSort: { field: 'name', asc: true }
};

// Configuración para Ciudades
export const cityConfig: EntityConfig<City> = {
  tableName: 'cities',
  displayName: 'Ciudad',
  fields: [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      maxLength: 256,
      placeholder: 'Ingrese el nombre de la ciudad'
    },
    {
      name: 'country_id',
      label: 'País',
      type: 'select',
      required: true,
      options: [], // Se llenará dinámicamente
      placeholder: 'Seleccione un país'
    },
    {
      name: 'state_id',
      label: 'Estado',
      type: 'select',
      required: false,
      options: [], // Se llenará dinámicamente
      placeholder: 'Seleccione un estado (opcional)'
    }
  ],
  searchFields: ['name'],
  sortableFields: ['name'],
  defaultSort: { field: 'name', asc: true }
};

// Configuración para Parroquias
export const parishConfig: EntityConfig<Parish> = {
  tableName: 'parishes',
  displayName: 'Parroquia',
  fields: [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      maxLength: 256,
      placeholder: 'Ingrese el nombre de la parroquia'
    },
    {
      name: 'diocese',
      label: 'Diócesis',
      type: 'text',
      required: false,
      maxLength: 256,
      placeholder: 'Ingrese el nombre de la diócesis'
    },
    {
      name: 'address',
      label: 'Dirección',
      type: 'text',
      required: false,
      maxLength: 256,
      placeholder: 'Ingrese la dirección'
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'text',
      required: false,
      maxLength: 50,
      placeholder: 'Ingrese el número de teléfono'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: false,
      maxLength: 256,
      placeholder: 'Ingrese el email'
    },
    {
      name: 'city_id',
      label: 'Ciudad',
      type: 'select',
      required: false,
      options: [], // Se llenará dinámicamente
      placeholder: 'Seleccione una ciudad'
    }
  ],
  searchFields: ['name', 'diocese'],
  sortableFields: ['name', 'diocese'],
  defaultSort: { field: 'name', asc: true }
};

// Configuración para Caminos de Formación
export const stepWayConfig: EntityConfig<StepWay> = {
  tableName: 'step_ways',
  displayName: 'Camino de Formación',
  fields: [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      maxLength: 256,
      placeholder: 'Ingrese el nombre del camino'
    },
    {
      name: 'order_num',
      label: 'Orden',
      type: 'number',
      required: false,
      placeholder: 'Ingrese el orden numérico'
    }
  ],
  searchFields: ['name'],
  sortableFields: ['name', 'order_num'],
  defaultSort: { field: 'order_num', asc: true }
};

// Configuración para Tipos de Equipo
export const teamTypeConfig: EntityConfig<TeamType> = {
  tableName: 'team_types',
  displayName: 'Tipo de Equipo',
  fields: [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      maxLength: 256,
      placeholder: 'Ingrese el nombre del tipo de equipo'
    },
    {
      name: 'order_num',
      label: 'Orden',
      type: 'number',
      required: false,
      placeholder: 'Ingrese el orden numérico'
    }
  ],
  searchFields: ['name'],
  sortableFields: ['name', 'order_num'],
  defaultSort: { field: 'order_num', asc: true }
};

// Exportar todas las configuraciones
export const entityConfigs = {
  countries: countryConfig,
  states: stateConfig,
  cities: cityConfig,
  parishes: parishConfig,
  stepWays: stepWayConfig,
  teamTypes: teamTypeConfig
}; 