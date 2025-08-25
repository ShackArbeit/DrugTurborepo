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
import { ChevronRight, ArrowLeft, Edit3, FileText } from 'lucide-react';

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm hover:shadow transition-all">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-semibold tracking-tight text-foreground break-words">
        {value ?? '-'}
      </div>
    </div>
  );
}

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const numericId = Number(id);
  const { data, loading, error } = useQuery(GET_CASE_BY_ID, { variables: { id: numericId } });

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded-md bg-muted" />
          <div className="h-12 w-3/4 rounded-md bg-muted" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 text-center">
        <div className="mx-auto max-w-md rounded-xl border border-destructive/40 bg-destructive/10 p-6">
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
      {/* 頂部工具列（含麵包屑 & 動作按鈕） */}
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

          {/* 動作按鈕：全部以 Button asChild 包 Link，強化一致的互動感 */}
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

      {/* 案件資訊卡片 */}
      <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 opacity-80" />
            案件資訊
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Info label="案件資料建立者" value={c.Creator_Name} />
            <Info label="年度" value={String(c.year)} />
            <Info label="案件類型" value={c.caseType} />
            <Info label="送件單位" value={c.submitUnit} />
            <Info label="股別" value={c.section} />
            <Info label="冠字" value={c.prefixLetter} />
            <Info label="送件人姓名" value={c.submitterName} />
            <Info label="手機" value={c.submitterPhone} />
            <Info label="市話" value={c.submitterTel} />
            <Info label="建立時間" value={c.createdAt} />
          </div>
          <Separator />
          {/* 證物清單 */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-lg font-semibold tracking-tight">
                  證物（共 {c.evidences?.length ?? 0} 件）
                </div>
                <Badge variant="outline" className="rounded-full">
                  {c.caseNumber}
                </Badge>
              </div>

              <ul className="space-y-3">
                {c.evidences?.map((e: any) => (
                  <li key={e.id}>
                    {/* 只保留一個 Link（<a>），避免 <a> 內再放 <a> */}
                    <Link
                      href={`/evidence/${e.id}`}
                      className="group block rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">證物編號</div>
                          <div className="text-base font-semibold tracking-tight">
                            {e.evidenceNumber}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">證物類型</div>
                          <div className="text-base font-semibold tracking-tight">
                            {e.evidenceType}
                          </div>
                        </div>

                        {/* 視覺上的「按鈕」，實際上是 span，因為整塊已是 Link */}
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
                  <li className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                    尚無證物
                  </li>
                )}
              </ul>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
