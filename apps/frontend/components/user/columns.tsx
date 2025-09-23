'use client';

import { ColumnDef } from '@tanstack/react-table';
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
  isRootAdmin?: boolean;     // 👈 新增：是否原始 admin（username === 'admin'）
  currentUserEmail?: string; // 現在登入者 email
  onRoleChange: (email: string, nextRole: 'user' | 'admin') => void;
}): ColumnDef<UserRow>[] {
  const { isAdmin, isRootAdmin = false, onRoleChange, currentUserEmail } = opts;

  return [
    { accessorKey: 'username', header: '使用者名稱',
      cell: ({ row }) => <span className="font-medium">{row.original.username}</span> },
    { accessorKey: 'email', header: '電子信箱',
      cell: ({ row }) => <span className="text-sm">{row.original.email}</span> },
    {
      accessorKey: 'role',
      header: '角色',
      cell: ({ row }) => {
        const u = row.original;
        const isSelf = !!currentUserEmail && u.email === currentUserEmail;
        const targetIsAdmin = String(u.role).toLowerCase() === 'admin';

        if (!isAdmin) {
          return <RoleBadge role={u.role} />;
        }

        const canEditThisRow = isRootAdmin ? !isSelf : (!isSelf && !targetIsAdmin);
        const allowed = isRootAdmin ? (['user', 'admin'] as const) : (['user'] as const);

        return (
          <div className="flex items-center gap-2">
            <RoleBadge role={u.role} />
            <RoleSelect
              value={(String(u.role).toLowerCase() as 'user' | 'admin') ?? 'user'}
              isSelf={isSelf}
              disabled={!canEditThisRow}
              allowed={[...allowed]} // 依權限決定可選項目
              onChange={(next) => onRoleChange(u.email, next)}
            />
          </div>
        );
      },
    },
  ];
}
