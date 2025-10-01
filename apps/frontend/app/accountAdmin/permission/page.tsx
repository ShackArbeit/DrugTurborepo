'use client';
import { useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { DataTable } from '@/components/user/data-table';
import { getUserColumns, type UserRow } from '@/components/user/columns';
import { ME_QUERY, USERS_QUERY, UPDATE_USER_ROLE } from '@/lib/graphql/UserGql';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LogoutButton from '@/components/auth/LogOutButton';
import { useTranslations } from 'next-intl';

const normalizeRole = (v: string | undefined | null): 'admin' | 'user' =>
  String(v).toLowerCase() === 'admin' ? 'admin' : 'user';

const toGqlRole = (v: 'admin' | 'user'): 'Admin' | 'User' =>
  v === 'admin' ? 'Admin' : 'User';


export default function PermissionsPage() {
  
  const { data: meData, loading: meLoading, error: meError } = useQuery(ME_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  useEffect(() => {
    if (meError) console.error('[ME_QUERY] error:', meError);
  }, [meError]);

  const meRaw = meData?.me as UserRow | undefined;

  const isAdmin = normalizeRole(meRaw?.role as any) === 'admin';
  const isRootAdmin = isAdmin && meRaw?.username === 'admin';

  const t = useTranslations('Common');

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refetch,
  } = useQuery(USERS_QUERY, {
    skip: !isAdmin,
    fetchPolicy: 'cache-and-network',
  });
  useEffect(() => {
    if (usersError) console.error('[USERS_QUERY] error:', usersError);
  }, [usersError]);

  const [updateUserRole, { error: updateError }] = useMutation(UPDATE_USER_ROLE);
  useEffect(() => {
    if (updateError) console.error('[UPDATE_USER_ROLE] error:', updateError);
  }, [updateError]);

  const baseRows: UserRow[] = isAdmin ? (usersData?.users ?? []) : meRaw ? [meRaw] : [];
  const rows: UserRow[] = baseRows.map((u) => ({ ...u, role: normalizeRole(u.role as any) }));

  const handleRoleChange = (email: string, nextLower: 'user' | 'admin') => {
    const currentList = rows;
    const target = currentList.find((r) => r.email === email);
    const nextEnum = toGqlRole(nextLower);
    const optimistic = {
      __typename: 'User' as const,
      id: target?.id ?? 'temp',
      username: target?.username ?? '',
      email,
      role: nextEnum,
    };

    updateUserRole({
      variables: { userEmail: email, newRole: nextEnum },
      optimisticResponse: { updateUserRole: optimistic },
      update(cache, { data }) {
        const updated = data?.updateUserRole;
        if (!updated) return;
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

  if (meError) {
    return (
      <main className="p-6">
        <h1 className="mb-2 text-lg font-semibold">{t('PermissionManagement')}</h1>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {t('MEQueryFailed', { message: meError.message })}
        </div>
      </main>
    );
  }
  if (isAdmin && usersError) {
    return (
      <main className="p-6">
        <h1 className="mb-2 text-lg font-semibold">{t('PermissionManagement')}</h1>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {t('USERSQueryFailed', { message: usersError.message })}
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
        <div className="rounded-md border bg-card p-4">{t('pleaseLogin')}</div>
      </main>
    );
  }
  if (!rows.length) {
    return (
      <main className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{t('PermissionManagement')}</h1>
          <div className="text-sm text-muted-foreground">
            {t('CurrentRole')}：
            <span className="ml-1 inline-block rounded border bg-red-200 px-2 py-0.5">
              {normalizeRole(meRaw.role as any) === 'admin' ? t('roleAdmin') : t('roleUser')}
            </span>
          </div>
        </div>
        <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
          {t('noUsersFound')}
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{t('PermissionManagement')}</h1>
        <Button asChild>
          <Link href="/">{t('home')}</Link>
        </Button>
        <LogoutButton />
        <div className="text-sm text-muted-foreground">
          {t('CurrentRole')}：
          <span className="ml-1 inline-block rounded border bg-red-200 px-2 py-0.5">
            {normalizeRole(meRaw.role as any) === 'admin' ? t('roleAdmin') : t('roleUser')}
          </span>
        </div>
      </div>

      {!isAdmin && (
        <p className="text-sm text-muted-foreground">{t('normalUserTip')}</p>
      )}

      <DataTable<UserRow, unknown>
        columns={columns}
        data={rows}
        searchColumnKey="email"
        searchPlaceholder={t('searchEmailPlaceholder')}
      />
    </main>
  );
}
