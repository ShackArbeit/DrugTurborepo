'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '../mode-toggle';
import LogoutButton from '../auth/LogOutButton';
import WelcomeBanner from '../auth/WelcomeBanner';

import Link from 'next/link';

export default function CasesToolbar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3 py-2">
      <WelcomeBanner />
      <div className="flex items-center gap-2">
        <Input
          placeholder="搜尋案件編號 / 案件摘要 / 送件單位 / 送件人"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="max-w-xl"
        />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">切換主題</span>
          <ModeToggle />
          <Button asChild variant="destructive">
            <Link href="/case/new">新增案件</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">返回首頁</Link>
          </Button>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
