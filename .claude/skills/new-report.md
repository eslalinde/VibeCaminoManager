---
name: new-report
description: 'Create a new report page for ComunidadCat using TanStack React Table with filtering, grouping, and print support.'
---

# New Report

Create report pages following the established ComunidadCat patterns with TanStack React Table.

## When to Use

- Adding a new report or data view
- User asks to "create a report", "add analytics", "build a dashboard view"

## Workflow

### 1. Gather Requirements

Ask the user:
- **Report name** (Spanish display name)
- **Data source**: Which tables/views? Does it need a new Supabase view or function?
- **Columns**: What data to show, with which labels
- **Filters**: Global search? Column-specific filters?
- **Grouping**: Can data be grouped by a field?
- **Aggregation**: Counts, sums, or other calculations?
- **Print support**: Should it be printable?

### 2. Data Layer

#### Option A: Use existing tables via React Query
Create a hook in `src/hooks/` following the pattern in `useReports.ts`:

```typescript
export function useReport[Name]() {
  const supabase = createClient();
  return useQuery({
    queryKey: queryKeys.reports.type('[report-name]'),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('[table_or_view]')
        .select('*, related_table(*)');
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
    gcTime: 300_000,
  });
}
```

#### Option B: Create a Supabase view
If the report needs complex joins or aggregations, create a migration with a view:

```sql
CREATE OR REPLACE VIEW public.report_[name]_view AS
SELECT ... FROM ... JOIN ... GROUP BY ...;
```

### 3. Report Page

Create `src/app/(main)/(protected)/reportes/[report-name]/page.tsx`:

```typescript
'use client';
import { useReport[Name] } from '@/hooks/useReports';
import { DynamicReportTable } from '@/components/reports/dynamic-table/DynamicReportTable';

export default function Report[Name]Page() {
  const { data, isLoading, error } = useReport[Name]();

  // Define columns for TanStack React Table
  const columns = useMemo(() => [
    // columnHelper.accessor('field', { header: 'Etiqueta', ... })
  ], []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">[Título del Reporte]</h1>
      <DynamicReportTable
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
      />
    </div>
  );
}
```

### 4. Components Available

The project has these report components in `src/components/reports/dynamic-table/`:
- **DynamicReportTable**: Main table with sorting, filtering, pagination
- **ColumnFilter**: Per-column filter inputs
- **GlobalFilter**: Search across all columns
- **GroupingControls**: Group rows by selected column

### 5. Navigation

Add the report link to the reports page (`src/app/(main)/(protected)/reportes/page.tsx`).

### 6. Print Support

Add print-friendly styling:
```tsx
<div className="print:block print:p-0">
  {/* Report content */}
</div>
<div className="print:hidden">
  {/* Controls hidden when printing */}
</div>
```

### 7. Verify

```bash
cd caminomanager && npm run type-check && npm run lint && npm run build
```

Test:
1. Navigate to the report page
2. Verify data loads correctly
3. Test search/filter/sort
4. Test print preview (Ctrl+P)
5. Verify with different data scenarios (empty, many records)
