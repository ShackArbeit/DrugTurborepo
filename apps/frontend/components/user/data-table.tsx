'use client';
import { useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Search, X } from 'lucide-react';


type  DataTableProps<TData,TValue>={
      columns:ColumnDef<TData,TValue>[];
      data:TData[],
      searchColumnKey?:string,
      searchPlaceholder?: string;
      className?:string
}

export function DataTable<TData,TValue>({
      columns,
      data,
      searchColumnKey = 'email',
      searchPlaceholder = 'Filter ...',
      className,
}:DataTableProps<TData,TValue>){
     const [sorting, setSorting] = useState<SortingState>([])
     const [columnFilters, setColumnFilters] =useState<ColumnFiltersState>([])
     const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
       const table = useReactTable({
            data,
            columns,
            state: {
                  sorting,
                  columnFilters,
                  columnVisibility
            },
            onSortingChange:setSorting,
            onColumnFiltersChange:setColumnFilters,
            getCoreRowModel: getCoreRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getSortedRowModel: getSortedRowModel(),
        })
        const searchCol = table.getColumn(searchColumnKey)
        const searchValue = (searchCol?.getFilterValue() as string ) ?? ''
  return (
         <div className={['space-y-4', className].filter(Boolean).join(' ')}>
                {/* Toolbar */}
            <div className='flex w-full max-w-md items-center gap-2'>
              <div className='relative flex-1'>
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                          placeholder={searchPlaceholder}
                          value={searchValue}
                          className="pl-9"
                          onChange={(e)=>searchCol?.setFilterValue(e.target.value)}
                      />
                      {searchValue &&(
                        <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Clear"
                        onClick={()=>searchCol?.setFilterValue('')}
                        >
                               <X className="h-4 w-4" />
                        </button>
                      )}
              </div>
            </div>
            {/* Body Part */}
             <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-auto">
          <Table className="min-w-[640px]">
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-muted/50">
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <TableHead key={header.id} className="whitespace-nowrap">
                        {header.isPlaceholder ? null : canSort ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() =>
                              header.column.toggleSorting(sorted === 'asc')
                            }
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="even:bg-muted/30 hover:bg-muted/60 transition-colors"
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
 </div>
  )
}