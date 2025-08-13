'use client';

import * as React from 'react';
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
  globalFilterPlaceholder = '搜尋…',
}: Props<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

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
    <div className="space-y-4"> 
   
      <div className="bg-white rounded-xl shadow-md overflow-hidden"> 
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-b border-gray-200">
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className="
                    h-12 
                    px-6
                    text-lg font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {h.isPlaceholder ? null : (
                      <div
                        className={`${
                          h.column.getCanSort()
                            ? 'cursor-pointer select-none hover:text-cyan-600 transition-colors'
                            : ''
                        }`}
                        // onClick={h.column.getToggleSortingHandler()}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {/* {h.column.columnDef.header as React.ReactNode} */}
                        {/* {({ asc: ' ▲', desc: ' ▼' } as any)[
                          h.column.getIsSorted() as string
                        ] ?? null} */}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="
                  text-base
                  border-b border-gray-300 last:border-b-0 hover:bg-gray-50 transition-colors"
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
                  className="h-24 text-center text-gray-500"
                >
                  沒有資料
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-3 p-4 bg-white rounded-xl shadow-md">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="rounded-full border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
        >
             上一頁
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="rounded-full border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
        >
            下一頁
        </Button>
        <div className="text-sm font-medium text-gray-600">
          第 {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} 頁
        </div>
      </div>
    </div>
  );
}