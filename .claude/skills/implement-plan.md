---
name: implement-plan
description: 'Implement technical plans phase by phase with verification. Adapted for the Next.js + Electron + Supabase stack.'
---

# Implement Plan

You are tasked with implementing an approved technical plan. Plans contain phases with specific changes and success criteria for the ComunidadCat application.

## Getting Started

When given a plan (path or inline):
- Read the plan completely and check for any existing checkmarks (`- [x]`)
- Read the original requirements and **all files mentioned** in the plan
- Read files fully - never use limit/offset, you need complete context
- Understand the domain context (Spanish UI, Neocatechumenal community management)
- Create a todo list to track progress
- Start implementing if you understand what needs to be done

If no plan is provided, ask for one.

## Implementation Philosophy

Follow the plan's intent while adapting to what you find. The codebase uses specific patterns that must be respected:

### Database Layer (Supabase)
1. Create migration in `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
2. Include RLS policies for all new tables
3. Test locally with `npx supabase db reset` (from `/supabase` directory)

### Type Layer
1. Add/update types in `src/types/database.ts`
2. Ensure types match the DB schema exactly

### Config Layer
1. Add `EntityConfig<T>` in `src/config/entities.ts` for new entities
2. Follow the established pattern: fields, searchFields, sortableFields, foreignKeys, renderValue

### Hook Layer
1. Standard CRUD: use `useCrud<T>` from `src/hooks/useCrud.ts`
2. Complex queries: create dedicated hooks in `src/hooks/` following `useCommunityData.ts` pattern
3. Always use `queryKeys` from `src/lib/queryKeys.ts`

### Component Layer
1. Standard entities: use `EntityPage` component
2. Detail pages: create in `src/app/(main)/(protected)/[entity]/detalle/page.tsx`
3. Modals: use Radix Dialog, follow `Select*Modal` patterns
4. All UI text in Spanish

### Route Layer
1. Add route in `src/app/(main)/(protected)/[entity]/page.tsx`
2. Update navigation if needed in the main layout

## Phase Execution

For each phase:
1. Implement all changes described
2. Run verification:
   ```bash
   cd caminomanager && npm run type-check   # TypeScript
   cd caminomanager && npm run lint          # ESLint
   cd caminomanager && npm run build         # Full build
   ```
3. Fix any issues before proceeding
4. Update checkboxes in the plan file
5. Pause for human verification:
   ```
   Phase [N] Complete - Ready for Verification

   Automated checks passed:
   - [List checks]

   Please verify manually:
   - [List manual checks from plan]

   Let me know when ready to proceed to Phase [N+1].
   ```

## Handling Mismatches

If the plan doesn't match reality:
```
Issue in Phase [N]:
Expected: [what the plan says]
Found: [actual state in codebase]
Why this matters: [impact explanation]

How should I proceed?
```

Common mismatches in this project:
- Table schema evolved since plan was written (check latest migration)
- Component API changed (check current props/types)
- New foreign key relationships added
- RLS policies differ from expected

## Resuming Work

If the plan has existing checkmarks:
- Trust completed work
- Pick up from the first unchecked item
- Verify previous work only if something seems off
- Check if new migrations have been added since the plan was written
