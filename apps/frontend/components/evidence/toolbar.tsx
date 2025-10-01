'use client';

import {Input} from '../ui/input';
import {Button} from '../ui/button';
import {ModeToggle} from '../mode-toggle';
import LogoutButton from '../auth/LogOutButton';
import Link from 'next/link';
import {useTranslations} from 'next-intl';


export default function EvidenceToolbar({
  value,
  onChange,
  isAdmin
}: {
  value: string;
  onChange: (v: string) => void;
  isAdmin: boolean;
}) {
  const t = useTranslations('Evidences.toolbar');
  const tc = useTranslations('Common');

  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <Input
        placeholder={t('searchPlaceholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-xl"
      />
      <div className="flex items-center gap-2">
        <span className="text-lg">{t('toggleLabel')}</span>
        <ModeToggle />
      </div>

      <Button variant="destructive" disabled={!isAdmin}>
        <Link href="/evidence/new">{t('create')}</Link>
      </Button>
      <Button asChild variant="secondary">
        <Link href="/">{tc('home')}</Link>
      </Button>
      <LogoutButton className="border border-2 border-fuchsia-900" />
    </div>
  );
}
