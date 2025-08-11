'use client'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  RowSelectionState,
  getSortedRowModel
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Case } from "@/lib/types"
import { useState } from "react"


type Props<TData,TValue>={
    columns:ColumnDef<TData,TValue>[]
    data:TData[]
    onSearch?: (kw: string) => void
    initialKeyword?: string
}

export function DataTable<TData extends Case,TValue>({
      columns,
      data,
      onSearch,
      initialKeyword,
}:Props<TData,TValue>){
      const [sorting,setSorting]=useState<SortingState>([])
      const [rowSelection,setRowSelection]=useState<RowSelectionState>({})

      const table = useReactTable({
            data,
            columns,
            state: { sorting, rowSelection },
            onSortingChange: setSorting,
            onRowSelectionChange: setRowSelection,
            getCoreRowModel: getCoreRowModel(),
            getSortedRowModel: getSortedRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
      })
     const [keyword,setKeyword]=useState(initialKeyword??"")
     return (
          <div>
              <h1>Hello World</h1>
          </div>
     )
}
