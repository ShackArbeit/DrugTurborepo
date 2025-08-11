// app/cases/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import type { Case } from "@/lib/types" // ← 你的最新 types.tsx

export const columns: ColumnDef<Case>[] = [
  // 列選取（Display column）
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="選取本頁所有列"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="選取列"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 30,
  },

  // 序號
  {
    accessorKey: "id",
    header: "序號",
    size: 64,
    cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<number>()}</span>,
  },

  // 案件編號（可排序，點擊導向詳細頁）
  {
    accessorKey: "caseNumber",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        案件編號 <ArrowUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link href={`/cases/${row.original.id}`} className="text-primary hover:underline">
        {row.original.caseNumber}
      </Link>
    ),
  },

  // 案由 / 案件類型
  { accessorKey: "caseType", header: "案由" },

  // 送件單位 / 送件人
  { accessorKey: "submitUnit", header: "送件單位" },
  { accessorKey: "submitterName", header: "送件人" },

  // 年度 / 股別 / 冠字
  { accessorKey: "year", header: "年度", cell: ({ getValue }) => getValue<number>() ?? "—" },
  { accessorKey: "section", header: "股別", cell: ({ getValue }) => getValue<string>() || "—" },
  { accessorKey: "prefixLetter", header: "冠字", cell: ({ getValue }) => getValue<string>() || "—" },

  // 證物數量（由 evidences 陣列長度計算）
  {
    id: "evidencesCount",
    header: "證物數",
    cell: ({ row }) => (Array.isArray(row.original.evidences) ? row.original.evidences.length : 0),
    enableSorting: false,
  },

  // 送件收件日期（可排序）
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        送件收件日期 <ArrowUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const v = getValue<string>()
      return v ? new Date(v).toLocaleString() : "—"
    },
  },
]
