import { EntityConfig, FormField } from '@/types/database';
import { Country, State, City, Parish, StepWay, TeamType, Person, Community } from '@/types/database';

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
  defaultSort: { field: 'name', asc: true },
  foreignKeys: [
    {
      foreignKey: 'country_id',
      tableName: 'countries',
      displayField: 'name',
      alias: 'country'
    }
  ]
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
  defaultSort: { field: 'name', asc: true },
  foreignKeys: [
    {
      foreignKey: 'country_id',
      tableName: 'countries',
      displayField: 'name',
      alias: 'country'
    },
    {
      foreignKey: 'state_id',
      tableName: 'states',
      displayField: 'name',
      alias: 'state'
    }
  ]
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
  defaultSort: { field: 'name', asc: true },
  foreignKeys: [
    {
      foreignKey: 'city_id',
      tableName: 'cities',
      displayField: 'name',
      alias: 'city'
    }
  ]
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

// Configuración para Personas
export const personConfig: EntityConfig<Person> = {
  tableName: 'people',
  displayName: 'Persona',
  fields: [
    {
      name: 'person_name',
      label: 'Nombre',
      type: 'text',
      required: true,
      maxLength: 256,
      placeholder: 'Ingrese el nombre completo'
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
      name: 'mobile',
      label: 'Celular',
      type: 'text',
      required: false,
      maxLength: 50,
      placeholder: 'Ingrese el número de celular'
    },
    {
      name: 'email',
      label: 'Correo electrónico',
      type: 'email',
      required: false,
      maxLength: 256,
      placeholder: 'Ingrese el correo electrónico'
    },
    {
      name: 'person_type_id',
      label: 'Carisma',
      type: 'select',
      required: false,
      options: [
        { value: 1, label: 'Casado' },
        { value: 2, label: 'Soltero' },
        { value: 3, label: 'Presbítero' },
        { value: 4, label: 'Seminarista' },
        { value: 5, label: 'Diácono' },
        { value: 6, label: 'Monja' },
        { value: 7, label: 'Viudo' }
      ],
      placeholder: 'Seleccione el carisma'
    },
    {
      name: 'gender_id',
      label: 'Género',
      type: 'select',
      required: false,
      options: [
        { value: 1, label: 'Masculino' },
        { value: 2, label: 'Femenino' }
      ],
      placeholder: 'Seleccione el género'
    },
    {
      name: 'spouse_id',
      label: 'Cónyuge',
      type: 'select',
      required: false,
      options: [], // Se llenará dinámicamente
      placeholder: 'Seleccione el cónyuge (opcional)'
    }
  ],
  searchFields: ['person_name', 'email'],
  sortableFields: ['person_name', 'email'],
  defaultSort: { field: 'person_name', asc: true },
  foreignKeys: [
    {
      foreignKey: 'spouse_id',
      tableName: 'people',
      displayField: 'person_name',
      alias: 'spouse'
    }
  ],
  // Función para renderizar valores personalizados en la tabla
  renderValue: (fieldName: string, value: any) => {
    if (fieldName === 'person_type_id') {
      const personTypeOptions = [
        { value: 1, label: 'Casado' },
        { value: 2, label: 'Soltero' },
        { value: 3, label: 'Presbítero' },
        { value: 4, label: 'Seminarista' },
        { value: 5, label: 'Diácono' },
        { value: 6, label: 'Monja' },
        { value: 7, label: 'Viudo' }
      ];
      const option = personTypeOptions.find(opt => opt.value === value);
      return option ? option.label : String(value || '');
    }
    
    if (fieldName === 'gender_id') {
      const genderOptions = [
        { value: 1, label: 'Masculino' },
        { value: 2, label: 'Femenino' }
      ];
      const option = genderOptions.find(opt => opt.value === value);
      return option ? option.label : String(value || '');
    }
    
    return String(value || '');
  }
};

// Configuración para Comunidades
export const communityConfig: EntityConfig<Community> = {
  tableName: 'communities',
  displayName: 'Comunidad',
  fields: [
    {
      name: 'number',
      label: 'Número',
      type: 'text',
      required: true,
      maxLength: 50,
      placeholder: 'Ingrese el número de la comunidad'
    },
    {
      name: 'born_date',
      label: 'Fecha de Nacimiento',
      type: 'text',
      required: false,
      placeholder: 'YYYY-MM-DD'
    },
    {
      name: 'parish_id',
      label: 'Parroquia',
      type: 'select',
      required: false,
      options: [], // Se llenará dinámicamente
      placeholder: 'Seleccione una parroquia'
    },
    {
      name: 'born_brothers',
      label: 'Hermanos Iniciales',
      type: 'number',
      required: false,
      placeholder: 'Ingrese el número de hermanos iniciales'
    },
    {
      name: 'actual_brothers',
      label: 'Hermanos Actuales',
      type: 'number',
      required: false,
      placeholder: 'Ingrese el número de hermanos actuales'
    },
    {
      name: 'step_way_id',
      label: 'Etapa Actual',
      type: 'select',
      required: false,
      options: [], // Se llenará dinámicamente
      placeholder: 'Seleccione la etapa actual'
    },
    {
      name: 'last_step_way_date',
      label: 'Fecha Última Etapa',
      type: 'text',
      required: false,
      placeholder: 'YYYY-MM-DD'
    }
  ],
  searchFields: ['number'],
  sortableFields: ['number', 'born_date', 'actual_brothers'],
  defaultSort: { field: 'number', asc: true },
  foreignKeys: [
    {
      foreignKey: 'parish_id',
      tableName: 'parishes',
      displayField: 'name',
      alias: 'parish'
    },
    {
      foreignKey: 'step_way_id',
      tableName: 'step_ways',
      displayField: 'name',
      alias: 'step_way'
    }
  ]
};

// Exportar todas las configuraciones
export const entityConfigs = {
  countries: countryConfig,
  states: stateConfig,
  cities: cityConfig,
  parishes: parishConfig,
  stepWays: stepWayConfig,
  teamTypes: teamTypeConfig,
  people: personConfig,
  communities: communityConfig
}; 