"use client";
import { Column } from "@tanstack/react-table";
import { Select, TextField } from "@radix-ui/themes";
import { DynamicColumnMeta } from "./types";

interface ColumnFilterProps<TData> {
  column: Column<TData, unknown>;
}

export function ColumnFilter<TData>({ column }: ColumnFilterProps<TData>) {
  const meta = column.columnDef.meta as DynamicColumnMeta | undefined;
  const filterType = meta?.filterType;

  if (!filterType) return null;

  const filterValue = (column.getFilterValue() as string) ?? "";

  if (filterType === "select") {
    const facetedValues = column.getFacetedUniqueValues();
    const sortedUniqueValues = Array.from(facetedValues.keys())
      .filter(Boolean)
      .sort();

    const ALL_VALUE = "__all__";

    return (
      <Select.Root
        size="1"
        value={filterValue || ALL_VALUE}
        onValueChange={(val) =>
          column.setFilterValue(val === ALL_VALUE ? undefined : val)
        }
      >
        <Select.Trigger
          variant="surface"
          placeholder="Todos"
          className="w-full text-xs"
        />
        <Select.Content>
          <Select.Item value={ALL_VALUE}>Todos</Select.Item>
          {sortedUniqueValues.map((value) => (
            <Select.Item key={String(value)} value={String(value)}>
              {String(value)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    );
  }

  return (
    <TextField.Root
      size="1"
      value={filterValue}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      placeholder="Filtrar..."
      className="w-full"
    />
  );
}
