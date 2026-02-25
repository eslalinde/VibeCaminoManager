---
name: supabase-migration
description: 'Create and manage Supabase migrations for ComunidadCat. Handles schema changes, RLS policies, views, and functions.'
---

# Supabase Migration

Create safe, well-structured Supabase migrations for ComunidadCat.

## When to Use

- Adding/modifying tables, columns, indexes, or constraints
- Creating/updating RLS policies
- Adding views or database functions
- User asks to "create a migration", "add a column", "change the schema"

## Workflow

### 1. Understand the Change

Before writing SQL:
- Read the latest migrations in `supabase/migrations/` to understand current schema
- Check if the change conflicts with existing constraints or policies
- Identify if RLS policies need updating

### 2. Generate Timestamp

Use the current UTC timestamp for the migration filename:

```bash
date -u +"%Y%m%d%H%M%S"
```

File: `supabase/migrations/[TIMESTAMP]_[description].sql`

### 3. Write the Migration

Follow these conventions:

#### New Tables
```sql
CREATE TABLE IF NOT EXISTS public.table_name (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- columns
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;
-- RLS policies (see below)
```

#### Adding Columns
```sql
ALTER TABLE public.table_name
  ADD COLUMN IF NOT EXISTS column_name TYPE [DEFAULT value] [NOT NULL];
```

#### Foreign Keys
```sql
ALTER TABLE public.table_name
  ADD CONSTRAINT fk_table_reference
  FOREIGN KEY (reference_id) REFERENCES public.referenced_table(id)
  ON DELETE CASCADE;  -- or SET NULL depending on relationship
```

#### RLS Policies
Always include policies for: SELECT, INSERT, UPDATE, DELETE
```sql
-- Standard pattern: all authenticated can read, admin+contributor can write, admin can delete
CREATE POLICY "table_select_authenticated"
  ON public.table_name FOR SELECT TO authenticated USING (true);

CREATE POLICY "table_insert_admin_contributor"
  ON public.table_name FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'contributor')
  ));

CREATE POLICY "table_update_admin_contributor"
  ON public.table_name FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'contributor')
  ));

CREATE POLICY "table_delete_admin"
  ON public.table_name FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

#### Views / Functions
```sql
CREATE OR REPLACE VIEW public.view_name AS
  SELECT ... FROM ...;

CREATE OR REPLACE FUNCTION public.function_name(...)
RETURNS ... LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- logic
END;
$$;
```

### 4. Test Locally

```bash
cd supabase
npx supabase db reset    # Apply all migrations from scratch
npx supabase db diff     # Check if schema matches expected state
```

### 5. Update TypeScript Types

After the migration:
1. Update interfaces in `src/types/database.ts` to match new schema
2. Update `EntityConfig` in `src/config/entities.ts` if fields changed
3. Run `cd caminomanager && npm run type-check` to verify

### Safety Rules

- **Never** drop tables or columns without explicit user confirmation
- **Always** use `IF NOT EXISTS` / `IF EXISTS` guards
- **Always** include RLS policies for new tables
- **Always** test with `npx supabase db reset` before committing
- **Never** modify existing migration files - create new ones instead
- Include comments explaining the purpose of complex constraints or policies
