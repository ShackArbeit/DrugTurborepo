'use client';

import { ColumnDef } from '@tanstack/react-table';
import { RoleBadge } from './role-badge';
import { RoleSelect } from './role-select';

export type UserRow = {
  id: string | number;
  username: string;
  email: string;
  role: 'user' | 'admin' | string; // 父層會已正規化成小寫
};

export function getUserColumns(opts: {
  isAdmin: boolean;
  currentUserEmail?: string; // 👈 新增：目前登入者 email
  onRoleChange: (email: string, nextRole: 'user' | 'admin') => void;
}): ColumnDef<UserRow>[] {
  const { isAdmin, onRoleChange, currentUserEmail } = opts;

  return [
    {
      accessorKey: 'username',
      header: 'Username',
      cell: ({ row }) => <span className="font-medium">{row.original.username}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <span className="text-sm">{row.original.email}</span>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const u = row.original;
        const isSelf = !!currentUserEmail && u.email === currentUserEmail;

        if (isAdmin) {
          return (
            <div className="flex items-center gap-2">
              <RoleBadge role={u.role} />
              <RoleSelect
                value={(u.role as 'user' | 'admin') ?? 'user'}
                isSelf={isSelf}                         // 👈 傳下去
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
