"use client";
import { Column } from "@tanstack/react-table";
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

    return (
      <select
        value={filterValue}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
      >
        <option value="">Todos</option>
        {sortedUniqueValues.map((value) => (
          <option key={String(value)} value={String(value)}>
            {String(value)}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type="text"
      value={filterValue}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      placeholder="Filtrar..."
      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
    />
  );
}
