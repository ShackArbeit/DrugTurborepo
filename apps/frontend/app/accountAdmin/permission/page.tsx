'use client';
import { useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { DataTable } from '@/components/user/data-table';
import { getUserColumns, type UserRow } from '@/components/user/columns';
import { ME_QUERY, USERS_QUERY, UPDATE_USER_ROLE } from '@/lib/graphql/UserGql';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LogoutButton from '@/components/auth/LogOutButton';


const normalizeRole = (v: string | undefined | null): 'admin' | 'user' =>
  String(v).toLowerCase() === 'admin' ? 'admin' : 'user';

const toGqlRole = (v: 'admin' | 'user'): 'Admin' | 'User' =>
  v === 'admin' ? 'Admin' : 'User';

export default function PermissionsPage() {
  // 1) me
  const { data: meData, loading: meLoading, error: meError } = useQuery(ME_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  useEffect(() => { if (meError) console.error('[ME_QUERY] error:', meError); }, [meError]);

  const meRaw = meData?.me as UserRow | undefined;
 
  const isAdmin = normalizeRole(meRaw?.role as any) === 'admin';
  const isRootAdmin = isAdmin && meRaw?.username === 'admin'; 

 
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refetch,
  } = useQuery(USERS_QUERY, {
    skip: !isAdmin,
    fetchPolicy: 'cache-and-network',
  });
  useEffect(() => { if (usersError) console.error('[USERS_QUERY] error:', usersError); }, [usersError]);

  // 3) 更新角色
  const [updateUserRole, { error: updateError }] = useMutation(UPDATE_USER_ROLE);
  useEffect(() => { if (updateError) console.error('[UPDATE_USER_ROLE] error:', updateError); }, [updateError]);

  // 4) 列資料：把 role 一律正規化成小寫，供 UI 使用
  const baseRows: UserRow[] = isAdmin ? (usersData?.users ?? []) : meRaw ? [meRaw] : [];
  const rows: UserRow[] = baseRows.map(u => ({ ...u, role: normalizeRole(u.role as any) }));

  // 5) 切換角色（只改 User 實體，不動 Query.users 陣列）
  const handleRoleChange = (email: string, nextLower: 'user' | 'admin') => {
    // 以最新資料找目標，避免舊閉包
    const currentList = rows; // 這裡 rows 已正規化小寫
    const target = currentList.find(r => r.email === email);

    // Optimistic 要用 GraphQL 期待的 Enum 值（"Admin"/"User"）
    const nextEnum = toGqlRole(nextLower);
    const optimistic = {
      __typename: 'User' as const,
      id: target?.id ?? 'temp',
      username: target?.username ?? '',
      email,
      role: nextEnum, // <- 重要：Enum 值要用 "Admin" | "User"
    };

    updateUserRole({
      variables: { userEmail: email, newRole: nextEnum }, 
      optimisticResponse: { updateUserRole: optimistic },
      update(cache, { data }) {
        const updated = data?.updateUserRole;
        if (!updated) return;

        // 透過 id 修改該實體的 role（避免去 map Query.users 陣列）
        const entityId = cache.identify({ __typename: 'User', id: updated.id });
        if (entityId) {
          cache.modify({
            id: entityId,
            fields: {
              role() {
                return updated.role; 
              },
            },
          });
        }
      },
    }).finally(() => {
      if (isAdmin) refetch();
    });
  };

  const columns = getUserColumns({
    isAdmin,
    isRootAdmin,       
    currentUserEmail: meRaw?.email,
    onRoleChange: handleRoleChange, 
  });

  /* --------- UI 狀態處理 --------- */
  if (meError) {
    return (
      <main className="p-6">
        <h1 className="mb-2 text-lg font-semibold">權限管理</h1>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ME_QUERY 失敗：{meError.message}
        </div>
      </main>
    );
  }
  if (isAdmin && usersError) {
    return (
      <main className="p-6">
        <h1 className="mb-2 text-lg font-semibold">權限管理</h1>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          USERS_QUERY 失敗：{usersError.message}
        </div>
      </main>
    );
  }
  if (meLoading || (isAdmin && usersLoading)) {
    return (
      <main className="p-6 space-y-4">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-64 w-full animate-pulse rounded bg-muted" />
      </main>
    );
  }
  if (!meRaw) {
    return (
      <main className="p-6">
        <div className="rounded-md border bg-card p-4">請先登入。</div>
      </main>
    );
  }
  if (!rows.length) {
    return (
      <main className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">權限管理</h1>
          <div className="text-sm text-muted-foreground">
            目前身分：
            <span className="ml-1 inline-block rounded border bg-red-200 px-2 py-0.5">
              {normalizeRole(meRaw.role as any) === 'admin' ? 'Admin' : 'User'}
            </span>
          </div>
        </div>
        <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
          找不到可顯示的使用者資料。
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">權限管理</h1>
        <Button><Link href='/'>返回首頁</Link></Button>
        <LogoutButton />
        <div className="text-sm text-muted-foreground">
          目前身分：
          <span className="ml-1 inline-block rounded border bg-red-200  px-2 py-0.5">
            {normalizeRole(meRaw.role as any) === 'admin' ? 'Admin' : 'User'}
          </span>
        </div>
      </div>

      {!isAdmin && (
        <p className="text-sm text-muted-foreground">
          您是一般使用者，只能檢視自己的權限。
        </p>
      )}

      <DataTable<UserRow, unknown>
        columns={columns}
        data={rows}                    
        searchColumnKey="email"
        searchPlaceholder="搜尋 email…"
      />

      {/* <details className="rounded-md border bg-card p-4">
        <summary className="cursor-pointer text-sm font-medium">Debug</summary>
        <pre className="mt-2 overflow-auto rounded bg-muted p-3 text-xs">
{JSON.stringify({ me: meRaw, users: usersData?.users ?? null }, null, 2)}
        </pre>
      </details> */}
    </main>
  );
}
