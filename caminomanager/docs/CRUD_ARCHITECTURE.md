# Arquitectura CRUD Reutilizable

Esta documentación describe la nueva arquitectura CRUD reutilizable implementada en el proyecto ComunidadCat.

## Visión General

La nueva arquitectura permite crear páginas CRUD completas para cualquier entidad maestra con un mínimo de código, manteniendo la consistencia y facilitando el mantenimiento.

## Componentes Principales

### 1. Tipos TypeScript (`/src/types/database.ts`)

Define las interfaces para todas las entidades y operaciones CRUD:

```typescript
// Entidad base
interface BaseEntity {
  id?: number;
  created_at?: string;
  updated_at?: string;
}

// Entidad específica
interface Country extends BaseEntity {
  name: string;
  code: string;
}

// Configuración de formulario
interface FormField {
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

// Configuración de entidad
interface EntityConfig<T> {
  tableName: string;
  displayName: string;
  fields: FormField[];
  searchFields: (keyof T)[];
  sortableFields: (keyof T)[];
  defaultSort: { field: keyof T; asc: boolean };
}
```

### 2. Hook CRUD (`/src/hooks/useCrud.ts`)

Hook personalizado que maneja todas las operaciones CRUD:

```typescript
const {
  data,
  loading,
  error,
  count,
  page,
  totalPages,
  search,
  sort,
  fetchData,
  create,
  update,
  delete: deleteItem,
  setSearch,
  setSort,
  setPage,
  clearError
} = useCrud<Country>({
  tableName: 'countries',
  searchFields: ['name', 'code'],
  defaultSort: { field: 'name', asc: true },
  pageSize: 10
});
```

### 3. Componentes Reutilizables

#### EntityTable (`/src/components/crud/EntityTable.tsx`)
Tabla genérica que muestra los datos de cualquier entidad.

#### EntityModal (`/src/components/crud/EntityModal.tsx`)
Modal genérico para formularios simples.

#### DynamicEntityModal (`/src/components/crud/DynamicEntityModal.tsx`)
Modal mejorado que maneja selectores dependientes automáticamente.

#### EntityPage (`/src/components/crud/EntityPage.tsx`)
Componente principal que combina todos los elementos CRUD.

### 4. Configuraciones de Entidades (`/src/config/entities.ts`)

Define la configuración para cada entidad maestra:

```typescript
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
```

## Cómo Crear una Nueva Página CRUD

### Paso 1: Definir los Tipos

Agregar la interfaz de la entidad en `/src/types/database.ts`:

```typescript
export interface MyEntity extends BaseEntity {
  name: string;
  description?: string;
  category_id?: number;
}
```

### Paso 2: Crear la Configuración

Agregar la configuración en `/src/config/entities.ts`:

```typescript
export const myEntityConfig: EntityConfig<MyEntity> = {
  tableName: 'my_entities',
  displayName: 'Mi Entidad',
  fields: [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      required: true,
      maxLength: 256,
      placeholder: 'Ingrese el nombre'
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      required: false,
      maxLength: 1000,
      placeholder: 'Ingrese la descripción'
    },
    {
      name: 'category_id',
      label: 'Categoría',
      type: 'select',
      required: false,
      placeholder: 'Seleccione una categoría'
    }
  ],
  searchFields: ['name', 'description'],
  sortableFields: ['name'],
  defaultSort: { field: 'name', asc: true }
};
```

### Paso 3: Crear la Página

Crear el archivo de la página en `/src/app/protected/myentities/page.tsx`:

```typescript
"use client";
import { EntityPage } from '@/components/crud/EntityPage';
import { myEntityConfig } from '@/config/entities';

export default function MyEntitiesPage() {
  return <EntityPage config={myEntityConfig} />;
}
```

## Características Avanzadas

### Selectores Dependientes

Para entidades con relaciones, el sistema maneja automáticamente los selectores dependientes:

```typescript
// En la configuración de ciudades
{
  name: 'country_id',
  label: 'País',
  type: 'select',
  required: true
},
{
  name: 'state_id',
  label: 'Estado',
  type: 'select',
  required: false
}
```

El `DynamicEntityModal` detectará automáticamente estas relaciones y:
- Cargará las opciones de países
- Cuando se seleccione un país, cargará los estados de ese país
- Limpiará los campos dependientes cuando cambie el padre

### Validación Personalizada

Puedes agregar validaciones personalizadas en la configuración:

```typescript
{
  name: 'email',
  label: 'Email',
  type: 'email',
  required: true,
  validation: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'El email no tiene un formato válido';
    }
    return null;
  }
}
```

### Manejo de Errores

El sistema maneja automáticamente errores específicos de Supabase:

- **23505**: Duplicados
- **23503**: Restricciones de clave foránea
- **23514**: Validación de datos
- **42501**: Permisos insuficientes

## Ventajas de la Nueva Arquitectura

1. **Reutilización**: Un solo conjunto de componentes para todas las entidades
2. **Consistencia**: UI y comportamiento uniforme en todas las páginas
3. **Mantenibilidad**: Cambios centralizados en un solo lugar
4. **Escalabilidad**: Fácil agregar nuevas entidades
5. **Type Safety**: TypeScript completo para prevenir errores
6. **Validación**: Sistema de validación robusto y extensible
7. **Relaciones**: Manejo automático de selectores dependientes

## Entidades Maestras Implementadas

- ✅ Países (`countries`)
- ✅ Estados (`states`)
- ✅ Ciudades (`cities`)
- ✅ Parroquias (`parishes`)
- ✅ Caminos de Formación (`step_ways`)
- ✅ Tipos de Equipo (`team_types`)

## Próximos Pasos

1. Implementar exportación de datos
2. Agregar filtros avanzados
3. Implementar bulk operations
4. Agregar auditoría de cambios
5. Implementar cache de opciones 