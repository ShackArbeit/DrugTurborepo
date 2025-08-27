'use client';

import { use } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CASE_BY_ID } from '@/lib/graphql/CaseGql';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  ArrowLeft,
  Edit3,
  FileText,
  Building2,
  UserRound,
  Gauge,
  Clock4,
  PackageSearch,
} from 'lucide-react';

/** 改版後的 Info：玻璃質感，左標籤 / 右值，支援自訂 col-span */
function Info({
  label,
  value,
  className = '',
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
        className,
      ].join(' ')}
    >
      {/* 左側導引條 */}
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
              'ring-1 ring-inset ring-border/60',
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
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const numericId = Number(id);
  const { data, loading, error } = useQuery(GET_CASE_BY_ID, { variables: { id: numericId } });

  if (loading) {
    // 更精緻 Skeleton
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-md bg-muted" />
          <div className="h-10 w-3/4 rounded-md bg-muted" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
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
          <div className="text-lg font-semibold text-destructive">載入失敗</div>
          <p className="mt-2 text-sm text-muted-foreground break-words">
            {String(error.message)}
          </p>
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/case">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回列表
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
                案件列表
              </Link>
              <ChevronRight className="mx-1 h-4 w-4 opacity-60" />
              <span className="font-medium text-foreground">案件詳細</span>
            </nav>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                案件編號：{c.caseNumber}
              </h1>
              <Badge variant="secondary" className="rounded-full">
                {c.caseType}
              </Badge>
            </div>
          </div>

          {/* 動作按鈕 */}
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild variant="outline">
              <Link href="/case">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回列表
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/case/${id}/edit`}>
                <Edit3 className="mr-2 h-4 w-4" />
                編輯
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 主卡片：包含多個分區塊，維持一致視覺節奏 */}
      <Card className="rounded-3xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
        {/* 區塊：案件資訊 */}
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 opacity-80" />
            案件資訊
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <section className="space-y-4">
            <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              基本資料
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Info label="案件資料建立者" value={c.Creator_Name} />
              <Info label="年度" value={String(c.year)} />
              <Info label="案件類型" value={c.caseType} />
              <Info label="冠字" value={c.prefixLetter} />
              <Info label="建立時間" value={c.createdAt} />
            </div>
          </section>

          <Separator />

          {/* 區塊：聯絡與單位 */}
          <section className="space-y-4">
            <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              聯絡與單位
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Info label="送件單位" value={c.submitUnit} />
              <Info label="股別" value={c.section} />
              <Info label="送件人姓名" value={c.submitterName} />
              <Info label="手機" value={c.submitterPhone} />
              <Info label="市話" value={c.submitterTel} />
            </div>
          </section>

          <Separator />

          {/* 區塊：滿意度 + 建立資訊 */}
          <section className="space-y-4">
            <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              滿意度與建立資訊
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Info label="案件承辦速度滿意度" value={c.satisfaction_levelOne} />
              <Info label="證物處理準確性滿意度" value={c.satisfaction_levelTwo} />
              <Info label="行政人員服務態度滿意度" value={c.satisfaction_levelThree} />
              <Info label="符合貴單位要求滿意度" value={c.satisfaction_levelFour} />
              <Info label="建立時間" value={c.createdAt} className="sm:col-span-2 xl:col-span-1" />
            </div>
          </section>

          <Separator />

          {/* 區塊：證物清單 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <PackageSearch className="h-4 w-4" />
                證物清單
              </div>
              <Badge variant="outline" className="rounded-full">
                {c.caseNumber}（共 {c.evidences?.length ?? 0} 件）
              </Badge>
            </div>

            <ul className="space-y-3">
              {c.evidences?.map((e: any) => (
                <li key={e.id}>
                  {/* 整塊即 Link，保證可鍵盤導覽 */}
                  <Link
                    href={`/evidence/${e.id}`}
                    className="group block rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">證物編號</div>
                        <div className="text-base font-semibold tracking-tight">
                          {e.evidenceNumber}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">證物類型</div>
                        <div className="text-base font-semibold tracking-tight">
                          {e.evidenceType}
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center justify-center rounded-md border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium text-foreground/90 transition-colors group-hover:border-primary/40 group-hover:bg-primary/10"
                        aria-hidden="true"
                      >
                        詳細內容
                        <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}

              {(!c.evidences || c.evidences.length === 0) && (
                <li className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                  尚無證物
                </li>
              )}
            </ul>
          </section>
        </CardContent>
      </Card>

      {/* 底部輕量工具列：回列表 / 編輯（在長內容捲動後也方便操作） */}
      <div className="mt-6 flex items-center justify-end gap-2">
        <Button asChild variant="outline">
          <Link href="/case">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/case/${id}/edit`}>
            <Edit3 className="mr-2 h-4 w-4" />
            編輯
          </Link>
        </Button>
      </div>
    </div>
  );
}
