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

  // ✅ 這裡改成優先讀 middleware 加上的 redirect，其次才是舊的 returnTo
  const searchParams = useSearchParams();
  const redirect =searchParams.get('redirect') || '/'
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await login({
        variables: { authInput: { username, password } },
      });

      const token = data?.login?.access_token;

      if (token) {
        // 1) 存 localStorage（給前端用）
        localStorage.setItem('token', token);

        // 2) 存 cookie（給 middleware 用）
        //   - 不要加 Secure，因為現在是 http://114.29.236.11:3000
        //   - Path=/ 讓所有路徑都帶上 token
        document.cookie = `token=${token}; Path=/; Max-Age=604800; SameSite=Lax`;

        // 3) 清掉舊的 cache，避免殘留登入狀態
        await client.resetStore();

        // 4) 登入成功導回原本想去的頁面（例如 /case 或 /evidence）
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
