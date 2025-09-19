'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { RoleBadge } from './role-badge';
import { RoleSelect } from './role-select';

export type UserRow = {
  id: string | number;
  username: string;
  email: string;
  role: 'user' | 'admin' | string;
};

export function getUserColumns(opts: {
  isAdmin: boolean;
  onRoleChange: (email: string, nextRole: 'user' | 'admin') => void;
}): ColumnDef<UserRow>[] {
  const { isAdmin, onRoleChange } = opts;

  return [
    {
      accessorKey: 'username',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Username
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.original.username}</span>,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => <span className="text-sm">{row.original.email}</span>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const u = row.original;
        if (isAdmin) {
          return (
            <div className="flex items-center gap-2">
              <RoleBadge role={u.role} />
              <RoleSelect
                value={(u.role as 'user' | 'admin') ?? 'user'}
                onChange={(next) => onRoleChange(u.email, next)}
              />
            </div>
          );
        }
        return <RoleBadge role={u.role} />;
      },
    },
  ];
}
