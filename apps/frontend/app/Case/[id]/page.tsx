'use client';

import {use} from 'react';
import {useQuery} from '@apollo/client';
import {GET_CASE_BY_ID} from '@/lib/graphql/CaseGql';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {ModeToggle} from '@/components/mode-toggle';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {Badge} from '@/components/ui/badge';
import {
  ChevronRight,
  ArrowLeft,
  Edit3,
  FileText,
  Building2,
  UserRound,
  Gauge,
  PackageSearch
} from 'lucide-react';
import LangSwitcher from '../../../components/LangSwitcher'
import {useTranslations} from 'next-intl';

/** 小資訊卡塊 */
function Info({
  label,
  value,
  className = ''
}: {
  label: string;
  value?: string;
  className?: string;
}) {
  return (
    <div
      className={[
        'group relative rounded-2xl border p-4 md:p-5',
        'bg-card/60 backdrop-blur',
        'border-border/60',
        'shadow-sm hover:shadow-md transition-shadow',
        className
      ].join(' ')}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-teal-400/70 to-sky-400/70 opacity-70 group-hover:opacity-100 transition-opacity"
      />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3">
        <div className="md:col-span-4 lg:col-span-5 xl:col-span-4">
          <div className="text-[11px] md:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
        </div>
        <div className="md:col-span-8 lg:col-span-7 xl:col-span-8">
          <div
            className={[
              'mt-0.5 md:mt-0 text-sm md:text-base font-medium',
              'text-foreground',
              'break-words [overflow-wrap:anywhere] hyphens-auto',
              'rounded-lg px-2 py-1',
              'bg-muted/40',
              'ring-1 ring-inset ring-border/60'
            ].join(' ')}
          >
            {value ?? '-'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CaseDetailPage({
  params
}: {
  params: Promise<{id: string}>;
}) {
  const t = useTranslations('CaseDetail');

  const {id} = use(params);
  const numericId = Number(id);
  const {data, loading, error} = useQuery(GET_CASE_BY_ID, {variables: {id: numericId}});

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-md bg-muted" />
          <div className="h-10 w-3/4 rounded-md bg-muted" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({length: 9}).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl border border-border/60 bg-muted/60" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="mx-auto max-w-md rounded-2xl border border-destructive/50 bg-destructive/10 p-6">
          <div className="text-lg font-semibold text-destructive">{t('error.title')}</div>
          <p className="mt-2 text-sm text-muted-foreground break-words">
            {String(error.message)}
          </p>
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/case">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('error.backToList')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const c = data.case;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* 頂部工具列 */}
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b bg-background/80 px-4 py-3 backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* 麵包屑 + 標題 */}
          <div>
            <nav className="mb-1 flex items-center text-sm text-muted-foreground">
              <Link href="/case" className="transition-colors hover:text-foreground">
                {t('breadcrumb.list')}
              </Link>
              <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
              <span className="font-medium text-foreground">{t('breadcrumb.detail')}</span>
            </nav>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {t('header.caseNumberLabel')}
                {c.caseNumber}
              </h1>
              <Badge variant="secondary" className="rounded-full">
                {c.caseType}
              </Badge>
            </div>
          </div>

          {/* 動作按鈕 */}
          <div className="flex items-center gap-2">
            <ModeToggle />
            <LangSwitcher/>
            <Button asChild variant="outline">
              <Link href="/case">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('header.backCases')}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/evidence">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('header.backEvidences')}
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/case/${id}/edit`}>
                <Edit3 className="mr-2 h-4 w-4" />
                {t('header.edit')}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 主卡片 */}
      <Card className="rounded-3xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
        {/* 案件資訊 */}
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 opacity-80" />
            {t('sections.info')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* 基本資料 */}
          <section className="space-y-4">
            <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              {t('sections.basic')}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Info label={t('fields.creator')} value={c.Creator_Name} />
              <Info label={t('fields.year')} value={String(c.year)} />
              <Info label={t('fields.caseType')} value={c.caseType} />
              <Info label={t('fields.prefixLetter')} value={c.prefixLetter} />
              <Info label={t('fields.createdAt')} value={c.createdAt} />
            </div>
          </section>

          <Separator />

          {/* 聯絡與單位 */}
          <section className="space-y-4">
            <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t('sections.contact')}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Info label={t('fields.submitUnit')} value={c.submitUnit} />
              <Info label={t('fields.section')} value={c.section} />
              <Info label={t('fields.submitterName')} value={c.submitterName} />
              <Info label={t('fields.submitterPhone')} value={c.submitterPhone} />
              <Info label={t('fields.submitterTel')} value={c.submitterTel} />
            </div>
          </section>

          <Separator />

          {/* 滿意度與建立資訊 */}
          <section className="space-y-4">
            <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              {t('sections.satisfaction')}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Info label={t('fields.sat1')} value={c.satisfaction_levelOne} />
              <Info label={t('fields.sat2')} value={c.satisfaction_levelTwo} />
              <Info label={t('fields.sat3')} value={c.satisfaction_levelThree} />
              <Info label={t('fields.sat4')} value={c.satisfaction_levelFour} />
              <Info label={t('fields.createdAt')} value={c.createdAt} className="sm:col-span-2 xl:col-span-1" />
            </div>
          </section>

          <Separator />

          {/* 證物清單 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <PackageSearch className="h-4 w-4" />
                {t('sections.evidence')}
              </div>
              <Badge variant="outline" className="rounded-full">
                {t('evidence.headerRight', {
                  caseNumber: c.caseNumber,
                  count: c.evidences?.length ?? 0
                })}
              </Badge>
            </div>

            <ul className="space-y-3">
              {c.evidences?.map((e: any) => {
                const picked = !!e.is_Pickup;
                const pickedClass =
                  'bg-slate-900 text-white border-slate-700 hover:border-slate-500 hover:bg-slate-800';
                const unpickedClass =
                  'bg-slate-100 text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50';

                return (
                  <li key={e.id}>
                    <Link
                      href={`/evidence/${e.id}`}
                      className={[
                        'group block rounded-2xl border p-4 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                        picked ? pickedClass : unpickedClass
                      ].join(' ')}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">{t('fields.evidenceNumber')}</div>
                          <div className="text-base font-semibold tracking-tight">{e.evidenceNumber}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">{t('fields.evidenceType')}</div>
                          <div className="text-base font-semibold tracking-tight">{e.evidenceType}</div>
                        </div>
                        <div className="text-base font-semibold tracking-tight">
                          {picked ? t('evidence.picked') : t('evidence.unpicked')}
                        </div>

                        <span
                          className="inline-flex items-center justify-center rounded-md border bg-muted/40 px-3 py-1.5 text-sm font-medium transition-colors group-hover:bg-primary/10"
                          aria-hidden="true"
                        >
                          {t('evidence.detail')}
                          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}

              {(!c.evidences || c.evidences.length === 0) && (
                <li className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                  {t('evidence.empty')}
                </li>
              )}
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
