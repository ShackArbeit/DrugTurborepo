'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useApolloClient } from '@apollo/client';
import { LOGIN_MUTATION } from '@/lib/graphql/AuthGql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@radix-ui/react-label';

export const dynamic = 'force-dynamic';

function LoginForm() {
  const router = useRouter();
  const client = useApolloClient();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);

  // ✅ 優先讀 middleware 加上的 redirect，其次才是舊的 returnTo，最後預設 '/'
  const searchParams = useSearchParams();
  const redirect =
    searchParams.get('redirect') || searchParams.get('returnTo') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await login({
        variables: { authInput: { username, password } },
      });

      const token = data?.login?.access_token;
      console.log('Login Token 值是:', token);

      if (token) {
        // 1) 寫入 localStorage & Cookie（給 middleware 用）
        localStorage.setItem('token', token);
        document.cookie = `token=${token}; Path=/; Max-Age=604800; SameSite=Lax`;

        // 2) 告訴同一分頁的元件（首頁）登入狀態已改變
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth-changed'));
        }

        // 3) 清掉舊的 Apollo cache
        await client.resetStore();

        // 4) 導回原本想去的頁面（例如 /case 或 /evidence）
        router.push(redirect);
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-100">
      <Card className="w-full max-w-sm shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            登入系統
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">帳號</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登入中...' : '登入'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">
          載入中…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
