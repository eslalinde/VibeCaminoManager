---
name: new-entity
description: 'Scaffold a complete CRUD entity for ComunidadCat: migration, types, config, hook wiring, route, and navigation.'
---

# New Entity

Scaffold a complete CRUD entity following ComunidadCat patterns. This creates all layers from database to UI.

## When to Use

- Adding a new data entity to the application
- User asks to "create a new entity", "add a table", or "scaffold CRUD for X"

## Workflow

### Phase 1: Gather Requirements

Ask the user:
- **Entity name** (Spanish display name + English table name)
- **Fields**: Name, type, required, constraints
- **Foreign keys**: Relationships to existing tables
- **Search/Sort**: Which fields are searchable and sortable
- **RLS**: Who can read/write (admin only? contributors? all authenticated?)

### Phase 2: Create Migration

Create `supabase/migrations/YYYYMMDDHHMMSS_add_[table]_table.sql`:

```sql
-- Create table
CREATE TABLE IF NOT EXISTS public.[table_name] (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- columns here
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.[table_name] ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust per requirements)
CREATE POLICY "[table]_select_authenticated"
  ON public.[table_name] FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "[table]_insert_admin_contributor"
  ON public.[table_name] FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'contributor'))
  );

CREATE POLICY "[table]_update_admin_contributor"
  ON public.[table_name] FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'contributor'))
  );

CREATE POLICY "[table]_delete_admin"
  ON public.[table_name] FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.[table_name]
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

### Phase 3: Add TypeScript Types

In `src/types/database.ts`, add:

```typescript
export interface [EntityName] extends BaseEntity {
  // fields matching the DB schema
}
```

### Phase 4: Add Entity Config

In `src/config/entities.ts`, add:

```typescript
export const [entity]Config: EntityConfig<[EntityName]> = {
  tableName: '[table_name]',
  displayName: '[Nombre en Español]',
  fields: [
    // FormField definitions
  ],
  searchFields: [...],
  sortableFields: [...],
  defaultSort: { field: 'name', asc: true },
  foreignKeys: [...],  // if any
};
```

Follow existing configs as reference (e.g., `countryConfig`, `parishConfig`).

### Phase 5: Add Query Keys

In `src/lib/queryKeys.ts`, add keys for the new entity if needed beyond the generic `crud` keys.

### Phase 6: Create Page Route

Create `src/app/(main)/(protected)/[route]/page.tsx`:

```typescript
'use client';
import { EntityPage } from '@/components/crud';
import { [entity]Config } from '@/config/entities';

export default function [Entity]Page() {
  return <EntityPage config={[entity]Config} />;
}
```

### Phase 7: Add Navigation

Update the navigation menu in the main layout to include the new route.

### Phase 8: Verify

Run all checks:
```bash
cd caminomanager && npm run type-check && npm run lint && npm run build
```

Test locally:
1. Reset Supabase: `cd supabase && npx supabase db reset`
2. Start dev: `npm run dev`
3. Verify CRUD operations work through the UI
4. Verify search and sort work
5. Verify RLS (test with different user roles if possible)
