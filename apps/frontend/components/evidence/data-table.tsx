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
import { Button } from '../ui/button';
import { useTranslations } from 'next-intl';

// ⬇️ 顏色轉換函式
function tailwindBgToRGBA(tw: string, opacity: number ): string {
  const colorMap: Record<string, string> = {
    'bg-red-100': 'rgba(254, 226, 226, OPACITY)',
    'bg-green-100': 'rgba(220, 252, 231, OPACITY)',
    'bg-yellow-100': 'rgba(254, 249, 195, OPACITY)',
    'bg-blue-100': 'rgba(219, 234, 254, OPACITY)',
    'bg-purple-100': 'rgba(237, 233, 254, OPACITY)',
    'bg-pink-100': 'rgba(252, 231, 243, OPACITY)',
    'bg-indigo-100': 'rgba(224, 231, 255, OPACITY)',
    'bg-teal-100': 'rgba(204, 251, 241, OPACITY)',
    'bg-orange-100': 'rgba(255, 237, 213, OPACITY)',
    'bg-lime-100': 'rgba(236, 252, 203, OPACITY)',
  };
  const base = colorMap[tw];
  return base ? base.replace('OPACITY', opacity.toString()) : '';
}

// 泛型：TData 必須要有 groupKey 屬性
type Props<TData extends { groupKey?: string; is_Pickup?: boolean }, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  groupColorMap?: Record<string, string>;
  globalFilterPlaceholder?: string;
};

export function EvidenceDataTable<TData extends { groupKey?: string; is_Pickup?: boolean }, TValue>({
  columns,
  data,
  groupColorMap,
}: Props<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const t = useTranslations('Common');

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
              <TableRow key={hg.id} className="border-b border-gray-200 dark:border-gray-600">
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className="h-12 px-6 text-lg font-semibold uppercase tracking-wider transition-colors duration-200 ease-in-out"
                  >
                    {h.isPlaceholder ? null : (
                      <div
                        className={`${
                          h.column.getCanSort()
                            ? 'cursor-pointer select-none hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 ease-in-out'
                            : ''
                        }`}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const groupKey = row.original.groupKey || '';
                const bgColorClass = groupColorMap?.[groupKey] ?? '';
                const style = bgColorClass
                  ? { backgroundColor: tailwindBgToRGBA(bgColorClass, 0.35) }
                  : undefined;

                return (
                  <TableRow
                    key={row.id}
                    style={style}
                    className="text-base text-gray-800 dark:text-gray-200 border-b border-gray-300 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out"
                  >
                    {row.getVisibleCells().map((cell, idx) => (
                      <TableCell key={cell.id} className="p-3 align-middle text-center">
                        {/* ✅ 在第一個欄位加符號 */}
                        {idx === 0 && row.original.is_Pickup ? '✔️ ' : null}
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500 dark:text-gray-400"
                >
                  {t('NoData')}
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
        >
          {t('PreviousPage')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {t('NextPage')}
        </Button>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {t('PageDisplay', {
            currentPage: table.getState().pagination.pageIndex + 1,
            totalPage: table.getPageCount(),
          })}
        </div>
      </div>
    </div>
  );
}
