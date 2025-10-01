'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Scale, FolderSearch, LogIn, PcCase, UserLock } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import LogoutButton from '@/components/auth/LogOutButton';
import LangSwitcher from '../components/LangSwitcher'
import {useTranslations} from 'next-intl';

export default function Home() {
  const router = useRouter();

 
  const [token, setToken] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState<boolean | null>(null); 
  const [ready, setReady] = useState(false);
  const t = useTranslations('Home')

  useEffect(() => {
    const read = () => {
      const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      setToken(t);
      setHasToken(Boolean(t));
      setReady(true);
    };
    read();

    // 跨分頁同步登入/登出
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') read();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const promptLogin = useCallback(async () => {
    const res = await Swal.fire({
      title: '需要登入',
      text: '若未登入將無法使用各項功能',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '前往登入',
      cancelButtonText: '稍後再說',
      confirmButtonColor: '#16a34a',
    });
    if (res.isConfirmed) router.push('/login');
  }, [router]);

  const alreadyLogin = useCallback(async () => {
    await Swal.fire({
      title: 'Already Logged In',
      text: '你已經登入過了，無須再次登入！',
      icon: 'question',
      confirmButtonText: '了解',
    });
  }, []);

  // 首頁自動提醒（可移除）
  useEffect(() => {
    if (hasToken === false) promptLogin();
  }, [hasToken, promptLogin]);

  const handleRegister = useCallback(() => {
    if (hasToken) {
      alreadyLogin();
    } else {
      router.push('/register');
    }
  }, [hasToken, alreadyLogin, router]);

  // 進入權限管理：以程式導頁，未登入先提示
  const gotoAdmin = useCallback(async () => {
    if (!token) {
      await Swal.fire({
        title: '需要登入',
        text: '若未登入將無法進入此頁面',
        icon: 'warning',
        confirmButtonText: '前往登入',
        showCancelButton: true,
        confirmButtonColor: '#16a34a',
      }).then((r) => {
        if (r.isConfirmed) router.push('/login');
      });
      return;
    }
    router.push('/accountAdmin/permission');
  }, [router, token]);

  // 尚未讀取 localStorage 時顯示占位
  if (!ready) {
    return (
      <main className="p-6 space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-40 animate-pulse rounded bg-muted" />
          <div className="h-40 animate-pulse rounded bg-muted" />
        </div>
      </main>
    );
  }

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
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl mb-5">
                  {t('Title')}
          </h1>
         
          <p className="mt-3 mb-4 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
              {t('subcontent')}
          </p>
          <p className="mt-2 mb-5 text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
            {t('changemode')} <ModeToggle />
          </p>
          <div>
            < LangSwitcher />
          </div>
         
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
              <CardTitle className="text-lg"> {t('caseRelate')}</CardTitle>
              <CardDescription>{t('caseContent')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/case" aria-label="前往案件相關頁">
                  {t('goCase')}
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
              <CardTitle className="text-lg">{t('evidRelate')}</CardTitle>
              <CardDescription>{t('evidContent')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="secondary">
                <Link href="/evidence" aria-label="前往證物相關頁">
                    {t('goEvid')}
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
              <CardTitle className="text-lg">{t('authRelate')}</CardTitle>
              <CardDescription>{t('authContent')}</CardDescription>
            </CardHeader>
            <CardContent>
              {token ? (
                <LogoutButton className="w-full bg-red-500" />
              ) : (
                <Button className="w-full" variant="destructive" onClick={handleRegister}>
                   {t('authButton')}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 使用者權限管理（Admin） */}
          <Card className="group relative transition-shadow hover:shadow-lg sm:col-span-2 md:col-span-1">
            <CardHeader className="space-y-2 text-center">
              <div className="relative bottom-1 m-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <UserLock className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <CardTitle className="text-lg">{t('adminRelte')}</CardTitle>
              <CardDescription>{t('adminCotent')}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 不用 <Link>，改程式導頁，才能在未登入時攔截 */}
              <Button className="w-full" >
                <Link href='/accountAdmin/permission'> {t('goAdmin')}</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {t('footerContent')}
        </footer>
      </div>
    </main>
  );
}
