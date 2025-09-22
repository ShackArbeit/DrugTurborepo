'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Scale, FolderSearch, LogIn, PcCase, UserLock } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

export default function Home() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState<boolean | null>(null); // null = 尚未讀取（避免 SSR/CSR 不一致）

  // 僅於瀏覽器端讀取 token；並監聽跨分頁登入/登出同步
  useEffect(() => {
    const read = () => {
      const t = localStorage.getItem('token');
      setHasToken(Boolean(t));
    };
    read();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') read();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // 未登入的提醒（想關閉自動提醒可刪除此 useCallback + useEffect）
  const promptLogin = useCallback(async () => {
    const result = await Swal.fire({
      title: '需要登入',
      text: '若未登入將無法使用各項功能',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '前往登入',
      cancelButtonText: '稍後再說',
      confirmButtonColor: '#16a34a',
    });
    if (result.isConfirmed) {
      router.push('/register');
    }
  }, [router]);

  useEffect(() => {
    if (hasToken === false) {
      // 首次判定未登入才提示（避免每次 render 都跳）
      promptLogin();
    }
  }, [hasToken, promptLogin]);

  // 已登入時點「註冊/登入」的處理：提醒後留在原頁
  const alreadyLogin = useCallback(async () => {
    await Swal.fire({
      title: 'Already Logged In',
      text: '你已經登入過了，無須再次登入！',
      icon: 'question',
      confirmButtonText: '了解',
    });
  }, []);

  // 註冊/登入按鈕點擊：未登入→前往 /register；已登入→提醒
  const handleRegister = useCallback(() => {
    if (hasToken) {
      // 已登入，不導頁
      alreadyLogin();
    } else {
      // 未登入，前往註冊/登入
      router.push('/register');
    }
  }, [hasToken, alreadyLogin, router]);

  return (
    <main
      className="relative min-h-[100dvh] overflow-hidden bg-background text-foreground"
      aria-label="臺灣高等檢察署數位鑑識首頁"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(60rem 30rem at 50% -10%, hsl(var(--primary)/0.08), transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted))/0.15_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted))/0.15_1px,transparent_1px)] bg-[size:44px_44px]"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:py-10">
        {/* Header */}
        <header className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-primary/5">
            <Scale className="h-10 w-10 text-primary" aria-hidden />
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            臺灣高等檢察署數位鑑識首頁
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
            提供案件資料、鑑識結果及權限式登入入口。
          </p>
          <p className="mt-2 text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
            模式變更 <ModeToggle />
          </p>
          <Separator className="mt-8 w-24 opacity-60" />
        </header>

        {/* Cards */}
        <section className="mt-12 grid gap-5 sm:grid-cols-2" aria-label="快速導引">
          {/* 案件相關 */}
          <Card className="group relative transition-shadow hover:shadow-lg">
            <CardHeader className="space-y-2 text-center">
              <div className="relative bottom-1 m-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <FolderSearch className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <CardTitle className="text-lg">案件相關</CardTitle>
              <CardDescription>新增、更新、刪除、查詢案件資料</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/case" aria-label="前往案件相關頁">
                  前往案件頁面
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 證物相關 */}
          <Card className="group relative transition-shadow hover:shadow-lg">
            <CardHeader className="space-y-2 text-center">
              <div className="relative bottom-1 m-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <PcCase className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <CardTitle className="text-lg">證物相關</CardTitle>
              <CardDescription>新增、更新、刪除、查詢證物資料</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="secondary">
                <Link href="/evidence" aria-label="前往案件相關頁">
                  前往證物頁面
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 使用者註冊 / 登入 */}
          <Card className="group relative transition-shadow hover:shadow-lg sm:col-span-2 md:col-span-1">
            <CardHeader className="space-y-2 text-center">
              <div className="relative bottom-1 m-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <LogIn className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <CardTitle className="text-lg">使用者註冊 / 登入</CardTitle>
              <CardDescription>以帳號密碼登入（支援 JWT）</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 用純 Button 控制導向／提醒，避免 Link 攔截失效與空 href 的問題 */}
              <Button className="w-full" variant="destructive" onClick={handleRegister}>
                註冊/登入
              </Button>
            </CardContent>
          </Card>

          {/* 使用者權限管理（Admin） */}
          <Card className="group relative transition-shadow hover:shadow-lg sm:col-span-2 md:col-span-1">
            <CardHeader className="space-y-2 text-center">
              <div className="relative bottom-1 m-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <UserLock className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <CardTitle className="text-lg">使用者帳密管理</CardTitle>
              <CardDescription>由 Admin 管理者管理</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/accountAdmin/permission" aria-label="前往管理頁面">
                  進入管理頁面
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} 臺灣高等檢察署 · 數位鑑識系統
        </footer>
      </div>
    </main>
  );
}
