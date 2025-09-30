'use client';

import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {ModeToggle} from '../mode-toggle';
import LogoutButton from '../auth/LogOutButton';
import WelcomeBanner from '../auth/WelcomeBanner';
import LangSwitcher from '../../components/LangSwitcher'
import Link from 'next/link';
import {useTranslations} from 'next-intl';

export default function CasesToolbar({
  value, onChange, isAdmin
}: {value: string; onChange: (v: string) => void; isAdmin: boolean;}) {
  const tCommon = useTranslations('Common');
  const tCases = useTranslations('Cases')

  return (
    <div className="space-y-3 py-2">
      <WelcomeBanner />
      <div className="flex items-center gap-2">
        <Input
           placeholder={`${tCommon('search')} ${tCases('columns.caseNumber')} / ${tCases('columns.CaseSummary')} / ${tCases('columns.submitUnit')} / ${tCases('columns.submitterName')}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="max-w-xl"
        />
        <div className="ml-auto flex items-center gap-2">
          <LangSwitcher />
          <span className="text-sm text-muted-foreground">{tCommon('theme')}</span>
          <ModeToggle />

          <Button variant="destructive" disabled={!isAdmin}>
            <Link href="/case/new">{tCommon('CreateCase')}</Link>
          </Button>

          <Button asChild variant="secondary">
            <Link href="/">{tCommon('home')}</Link>
          </Button>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
