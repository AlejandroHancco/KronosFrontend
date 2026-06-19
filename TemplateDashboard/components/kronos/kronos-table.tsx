"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

export interface KronosColumn<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  width?: string
  align?: "left" | "center" | "right"
  render?: (value: unknown, row: T, index: number) => React.ReactNode
}

interface KronosTableProps<T> {
  columns: KronosColumn<T>[]
  data: T[]
  selectable?: boolean
  selectedRows?: Set<number>
  onSelectionChange?: (selectedRows: Set<number>) => void
  sortColumn?: string
  sortDirection?: "asc" | "desc"
  onSort?: (column: string, direction: "asc" | "desc") => void
  emptyMessage?: string
  className?: string
  compact?: boolean
  stickyHeader?: boolean
}

export function KronosTable<T extends Record<string, unknown>>({
  columns,
  data,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  sortColumn,
  sortDirection,
  onSort,
  emptyMessage = "No data available",
  className,
  compact = false,
  stickyHeader = false,
}: KronosTableProps<T>) {
  const allSelected = data.length > 0 && selectedRows.size === data.length
  const someSelected = selectedRows.size > 0 && selectedRows.size < data.length

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange?.(new Set())
    } else {
      onSelectionChange?.(new Set(data.map((_, index) => index)))
    }
  }

  const handleSelectRow = (index: number) => {
    const newSelection = new Set(selectedRows)
    if (newSelection.has(index)) {
      newSelection.delete(index)
    } else {
      newSelection.add(index)
    }
    onSelectionChange?.(newSelection)
  }

  const handleSort = (column: string) => {
    if (!onSort) return
    const newDirection = sortColumn === column && sortDirection === "asc" ? "desc" : "asc"
    onSort(column, newDirection)
  }

  const getValue = (row: T, key: string): unknown => {
    const keys = key.split(".")
    let value: unknown = row
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k]
    }
    return value
  }

  return (
    <div className={cn("rounded-md border border-border", className)}>
      <Table>
        <TableHeader className={cn(stickyHeader && "sticky top-0 z-10 bg-card")}>
          <TableRow className="border-border hover:bg-transparent">
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={cn(someSelected && "data-[state=checked]:bg-primary/50")}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
                  column.width && `w-[${column.width}]`,
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  compact ? "h-9 px-3" : "h-11 px-4"
                )}
              >
                {column.sortable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(String(column.key))}
                    className="-ml-3 h-8 gap-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    {column.header}
                    {sortColumn === column.key ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="size-3" />
                      ) : (
                        <ArrowDown className="size-3" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 opacity-50" />
                    )}
                  </Button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={cn(
                  "border-border transition-colors",
                  selectedRows.has(rowIndex) && "bg-primary/5"
                )}
              >
                {selectable && (
                  <TableCell className={cn(compact ? "px-3 py-2" : "px-4 py-3")}>
                    <Checkbox
                      checked={selectedRows.has(rowIndex)}
                      onCheckedChange={() => handleSelectRow(rowIndex)}
                      aria-label={`Select row ${rowIndex + 1}`}
                    />
                  </TableCell>
                )}
                {columns.map((column) => {
                  const value = getValue(row, String(column.key))
                  return (
                    <TableCell
                      key={String(column.key)}
                      className={cn(
                        "text-sm",
                        column.align === "center" && "text-center",
                        column.align === "right" && "text-right",
                        compact ? "px-3 py-2" : "px-4 py-3"
                      )}
                    >
                      {column.render
                        ? column.render(value, row, rowIndex)
                        : String(value ?? "-")}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
