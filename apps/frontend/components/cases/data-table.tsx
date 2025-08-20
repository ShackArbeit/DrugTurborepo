'use client';

import { useState } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'; 
import { Button } from '@/components/ui/button'; 

type Props<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  globalFilterPlaceholder?: string;
};

export function DataTable<TData, TValue>({
  columns,
  data,
}: Props<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (  
    <div className="space-y-4 text-gray-900 dark:text-gray-100 font-inter">      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"> 
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {table.getHeaderGroups().map((hg) => (
              <TableRow 
                key={hg.id} 
                className="border-b border-gray-200 dark:border-gray-600"
              >
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className="
                      h-12 
                      px-6
                      text-lg font-semibold uppercase tracking-wider
                      transition-colors duration-200 ease-in-out
                    "
                  >
                    {h.isPlaceholder ? null : (
                      <div
                        className={`${
                          h.column.getCanSort()
                            ? 'cursor-pointer select-none hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 ease-in-out'
                            : ''
                        }`}
                        // onClick={h.column.getToggleSortingHandler()} 
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {/* {{ 
                          asc: ' ▲', 
                          desc: ' ▼' 
                        }[h.column.getIsSorted() as string] ?? null} */}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          {/* Table Body with row styling and hover effects for both modes */}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="
                    text-base
                    text-gray-800 dark:text-gray-200
                    border-b border-gray-300 dark:border-gray-700 
                    last:border-b-0 
                    hover:bg-gray-50 dark:hover:bg-gray-700 
                    transition-colors duration-200 ease-in-out
                  "
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500 dark:text-gray-400"
                >
                  沒有資料
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="
            rounded-full 
            border border-gray-300 dark:border-gray-600 
            text-gray-600 dark:text-gray-300 
            hover:bg-gray-100 dark:hover:bg-gray-700 
            dark:hover:text-gray-100
            transition-colors duration-200 ease-in-out
            px-4 py-2 
            focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          上一頁
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="
            rounded-full 
            border border-gray-300 dark:border-gray-600 
            text-gray-600 dark:text-gray-300 
            hover:bg-gray-100 dark:hover:bg-gray-700 
            dark:hover:text-gray-100
            transition-colors duration-200 ease-in-out
            px-4 py-2 
            focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          下一頁
        </Button>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
          第 {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} 頁
        </div>
      </div>
    </div>
  );
}