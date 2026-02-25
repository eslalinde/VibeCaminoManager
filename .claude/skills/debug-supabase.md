---
name: debug-supabase
description: 'Debug Supabase issues in ComunidadCat: RLS policy errors, query failures, auth problems, migration issues.'
---

# Debug Supabase

Systematic debugging of Supabase-related issues in ComunidadCat.

## When to Use

- Data not loading or showing empty results
- Permission denied errors (RLS)
- Authentication failures
- Migration errors during `db reset`
- Supabase query returning unexpected results
- User mentions "Supabase error", "data not showing", "permission denied"

## Diagnostic Workflow

### 1. Identify the Symptom

Ask or determine:
- **What operation fails?** (SELECT, INSERT, UPDATE, DELETE)
- **Which table?**
- **What error code/message?** (Check browser console / network tab)
- **Is the user authenticated?** What role?

### 2. Common Error Codes

| Code | Meaning | Likely Cause |
|------|---------|-------------|
| `23505` | Unique violation | Duplicate data, check unique constraints |
| `23503` | FK violation | Referenced record doesn't exist or cascade issue |
| `23514` | Check constraint | Invalid data value |
| `42501` | Insufficient privilege | RLS policy blocking the operation |
| `PGRST301` | Row not found | RLS filtering out rows silently |
| `42P01` | Table not found | Migration not applied |

### 3. RLS Debugging

RLS issues are the most common problems. Debug systematically:

#### Check if RLS is the issue
```sql
-- In Supabase SQL editor, as service_role (bypasses RLS)
SELECT * FROM table_name;

-- Then compare with what the user sees through the client
```

#### Check current policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'your_table';
```

#### Check user's role
```sql
SELECT id, role FROM public.profiles WHERE id = auth.uid();
```

#### Common RLS fixes
- Policy missing for the operation (SELECT/INSERT/UPDATE/DELETE)
- Policy checks `auth.uid()` but user is not authenticated
- Role check doesn't include the user's actual role
- `WITH CHECK` clause too restrictive for INSERT/UPDATE

### 4. Query Debugging

Check the hook in `src/hooks/`:

```typescript
// Common issues:
// 1. Missing .select() fields (especially for foreign key joins)
const { data } = await supabase
  .from('table')
  .select('*, related_table(name)');  // Don't forget nested selects

// 2. Wrong filter operators
.eq('field', value)    // exact match
.ilike('field', `%${search}%`)  // case-insensitive search
.in('id', ids)         // multiple values

// 3. Missing error handling
const { data, error } = await supabase.from('table').select('*');
if (error) throw error;  // Don't ignore errors
```

### 5. Auth Debugging

Check `src/contexts/AuthContext.tsx` flow:
1. Is `getSession()` returning a valid session?
2. Is the `profiles` table accessible (RLS on profiles)?
3. Is the auth state listener (`onAuthStateChange`) firing?
4. Check `SIGNED_OUT` handling (auto-redirect)

### 6. Migration Debugging

```bash
cd supabase

# Reset and reapply all migrations
npx supabase db reset

# Check for syntax errors in specific migration
npx supabase db diff

# View applied migrations
npx supabase migration list
```

Common migration issues:
- Duplicate constraint names across migrations
- Missing `IF NOT EXISTS` / `IF EXISTS` guards
- Column type mismatches with existing data
- Foreign key referencing non-existent table (migration order)

### 7. Local vs Cloud

If it works locally but not in production:
- Check that migrations are deployed (`supabase-migrations.yml` workflow)
- Compare RLS policies between environments
- Verify environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Check Supabase dashboard logs for detailed error info

### Resolution Checklist

- [ ] Identified the specific error code/message
- [ ] Determined if it's RLS, query, auth, or schema related
- [ ] Tested the fix locally with `npx supabase db reset`
- [ ] Verified TypeScript types match the updated schema
- [ ] Ran `npm run type-check` and `npm run build`
