import * as React from "react"
import { Table as RadixTable } from "@radix-ui/themes"
import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  React.ElementRef<typeof RadixTable.Root>,
  React.ComponentPropsWithoutRef<typeof RadixTable.Root>
>(({ className, ...props }, ref) => (
  <RadixTable.Root
    ref={ref}
    className={cn("w-full caption-bottom text-sm", className)}
    {...props}
  />
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  React.ElementRef<typeof RadixTable.Header>,
  React.ComponentPropsWithoutRef<typeof RadixTable.Header>
>(({ className, ...props }, ref) => (
  <RadixTable.Header
    ref={ref}
    className={cn("[&_tr]:border-b", className)}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  React.ElementRef<typeof RadixTable.Body>,
  React.ComponentPropsWithoutRef<typeof RadixTable.Body>
>(({ className, ...props }, ref) => (
  <RadixTable.Body
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  React.ElementRef<typeof RadixTable.Body>,
  React.ComponentPropsWithoutRef<typeof RadixTable.Body>
>(({ className, ...props }, ref) => (
  <RadixTable.Body
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  React.ElementRef<typeof RadixTable.Row>,
  React.ComponentPropsWithoutRef<typeof RadixTable.Row>
>(({ className, ...props }, ref) => (
  <RadixTable.Row
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted text-sm min-h-0 h-6",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  React.ElementRef<typeof RadixTable.ColumnHeaderCell>,
  React.ComponentPropsWithoutRef<typeof RadixTable.ColumnHeaderCell>
>(({ className, ...props }, ref) => (
  <RadixTable.ColumnHeaderCell
    ref={ref}
    className={cn(
      "h-6 px-0 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  React.ElementRef<typeof RadixTable.Cell>,
  React.ComponentPropsWithoutRef<typeof RadixTable.Cell>
>(({ className, style, ...props }, ref) => (
  <RadixTable.Cell
    ref={ref}
    className={cn(
      "p-0 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    style={{ verticalAlign: 'middle', ...style }}
    {...props}
  />
))
TableCell.displayName = "TableCell"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} 