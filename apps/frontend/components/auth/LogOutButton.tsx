'use client';

import React from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, LogIn } from 'lucide-react';

import { Button } from '../ui/button';
import { GET_ME } from '@/lib/graphql/AuthGql';
import { useTranslations } from 'next-intl';

type Props = {
  className?: string;
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
  label?: string;
};

export default function LogoutButton({
  className,
  variant = 'outline',
  size = 'lg',
}: Props) {
  const router = useRouter();
  const client = useApolloClient();
  const tCommon = useTranslations('Common');

  // 這裡只在客戶端讀一次 token，用來決定要顯示登入或登出按鈕
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const { data, loading, error } = useQuery(GET_ME, {
    skip: !token,
    fetchPolicy: 'network-only',
  });

  // 沒有 token：顯示「登入」按鈕
  if (!token) {
    return (
      <Button asChild variant={variant} size={size} className={className}>
        <Link href="/login">
          <LogIn className="mr-2 h-4 w-4" />
          {tCommon('login')}
        </Link>
      </Button>
    );
  }

  // 有 token 但 user 還在載入 / 出錯時，就先不要顯示按鈕（避免閃爍）
  if (loading || error) return null;

  const username = data?.me?.username;

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      // 1) 清掉 token
      localStorage.removeItem('token');
      document.cookie = 'token=; Path=/; Max-Age=0; SameSite=Lax';

      // 2) 通知同一個分頁的其他元件（首頁）重新讀 token
      window.dispatchEvent(new CustomEvent('auth-changed'));
    }

    // 3) 清掉 Apollo 快取
    await client.clearStore().catch(() => client.resetStore());

    // 4) 回首頁並刷新，確保畫面完全更新
    router.push('/');
    router.refresh();
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      aria-label={username ? `登出 ${username}` : '登出'}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {tCommon('logout')}
    </Button>
  );
}
