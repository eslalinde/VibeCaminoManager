// Componentes CRUD
export { EntityPage } from './EntityPage';
export { EntityTable } from './EntityTable';
export { EntityModal } from './EntityModal';
export { DynamicEntityModal } from './DynamicEntityModal';

// UI Components
export { Textarea, TextareaPrimitive } from '@/components/ui/textarea';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Hooks CRUD
export { useCrud } from '@/hooks/useCrud';
export { 
  useEntityOptions, 
  useCountryOptions, 
  useStateOptions, 
  useCityOptions, 
  useParishOptions 
} from '@/hooks/useEntityOptions';

// Tipos
export type { 
  BaseEntity, 
  Country, 
  State, 
  City, 
  Parish, 
  StepWay, 
  TeamType,
  FormField,
  EntityConfig,
  CrudOperation,
  QueryParams
} from '@/types/database';

// Configuraciones
export { 
  countryConfig,
  stateConfig,
  cityConfig,
  parishConfig,
  stepWayConfig,
  teamTypeConfig,
  entityConfigs
} from '@/config/entities'; 