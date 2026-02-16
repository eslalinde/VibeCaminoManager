import { ColumnDef, SortingState } from "@tanstack/react-table";

export interface DynamicColumnMeta {
  filterType?: "text" | "select";
  enableGrouping?: boolean;
  aggregationType?: "count" | "sum" | "uniqueCount";
  aggregationLabel?: string;
  align?: "left" | "center" | "right";
}

export interface DynamicReportConfig<TData> {
  title: string;
  description: string;
  columns: ColumnDef<TData, any>[];
  exportFileName?: string;
  defaultGrouping?: string[];
  defaultSorting?: SortingState;
  globalFilterPlaceholder?: string;
}

export interface DynamicReportTableProps<TData> {
  config: DynamicReportConfig<TData>;
  data: TData[];
  loading: boolean;
  onRefresh: () => void;
}
