'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CasesToolbar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <Input
        placeholder="搜尋案件編號 / 案件摘要 / 送件單位 / 送件人"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-xl"
      />
      <Button asChild>
        <Link href="/cases/new">新增案件</Link>
      </Button>
    </div>
  );
}
