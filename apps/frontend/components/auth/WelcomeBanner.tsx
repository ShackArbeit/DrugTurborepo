'use client';
import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ME } from '@/lib/graphql/AuthGql';
import {useTranslations} from 'next-intl';

export default function WelcomeBanner() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const tCommon = useTranslations('Common');
  const { data, loading, error, refetch } = useQuery(GET_ME, {
    skip: !token,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (token) refetch();
  }, [token, refetch]);

  if (!token || loading || error) return null;

  const username = data?.me?.username;
  if (!username) return null;

  return (
    <div className="w-full rounded-2xl border border-border/60 bg-gradient-to-r from-sky-50 via-teal-50 to-emerald-50 px-4 py-3 shadow-sm dark:from-sky-900/20 dark:via-teal-900/20 dark:to-emerald-900/20">
      <div className="flex items-center gap-2 text-sm md:text-base">
        <span>👋</span>
        <span>
          Hi，<span className="font-semibold text-primary">{username}</span>，  {tCommon('WelcomeBack')}！
        </span>
      </div>
    </div>
  );
}
