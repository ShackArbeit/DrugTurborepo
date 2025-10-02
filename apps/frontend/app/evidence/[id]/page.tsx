'use client';

import { use } from 'react';
import { useQuery } from '@apollo/client';
import { GET_EVIDENCE_BY_ID } from '@/lib/graphql/EvidenceGql';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { useTranslations } from 'next-intl';


/** 更穩健的值轉字串工具 */
function normalizeDisplay(value?: string | boolean | Date | null): string {
  if (value === null || value === undefined) return '-';
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (typeof value === 'string') {
    // ISO 字串日期處理
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)) {
      const d = new Date(value);
      return isNaN(d.getTime()) ? value : d.toLocaleString();
    }
    const trimmed = value.trim();
    return trimmed === '' ? '-' : trimmed;
  }
  try {
    return String(value);
  } catch {
    return '-';
  }
}

/** 改版後的 Info：更像「表單欄位卡」；小螢幕上下排，md+ 左右雙欄 */
function Info({
  label,
  value,
  className = '',
}: {
  label: string;
  value?: string | boolean | Date | null;
  /** 可傳入 grid 的 col-span，例如 'sm:col-span-2 xl:col-span-1' */
  className?: string;
}) {
  const displayValue = normalizeDisplay(value);

  return (
    <div
      className={[
        'group relative rounded-2xl border p-4 md:p-5',
        'bg-white/70 dark:bg-zinc-900/60 backdrop-blur',
        'border-zinc-200/70 dark:border-zinc-800',
        'shadow-sm hover:shadow-md transition-shadow',
        className,
      ].join(' ')}
    >
      {/* 左側垂直導引條，提供視覺節奏 */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-teal-400/70 to-sky-400/70 dark:from-teal-500/50 dark:to-sky-500/50 opacity-60 group-hover:opacity-100 transition-opacity"
      />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3">
        <div className="md:col-span-4 lg:col-span-5 xl:col-span-4">
          <div className="text-[11px] md:text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {label}
          </div>
        </div>
        <div className="md:col-span-8 lg:col-span-7 xl:col-span-8">
          <div
            className={[
              'mt-0.5 md:mt-0 text-sm md:text-base font-medium',
              'text-zinc-900 dark:text-zinc-100',
              'break-words [overflow-wrap:anywhere] hyphens-auto',
              'rounded-lg px-2 py-1',
              'bg-zinc-50/70 dark:bg-zinc-800/40',
              'ring-1 ring-inset ring-zinc-200/60 dark:ring-zinc-700/60',
            ].join(' ')}
          >
            {displayValue}
          </div>
        </div>
      </div>
    </div>
  );
}

function CaseSummaryCard({
  caseNumber,
  caseName,
  ordinal,
}: {
  caseNumber?: string | null;
  caseName?: string | null;
  ordinal: number | string;
}) {
  const t = useTranslations('EvidenceDetail');
  return (
    <div className="w-full rounded-3xl border overflow-hidden shadow-sm dark:border-zinc-800">
      {/* 漸層標頭，與徽章 */}
      <div className="relative">
        <div className="h-20 md:h-24 bg-gradient-to-r from-sky-200 via-teal-200 to-emerald-200 dark:from-sky-900/40 dark:via-teal-900/30 dark:to-emerald-900/30" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-6 pb-4 md:pb-5 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t('sections.caseInfo')}
            </h2>
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold text-teal-700 dark:text-teal-300 border-teal-300/60 dark:border-teal-700/50 bg-white/70 dark:bg-zinc-900/50 backdrop-blur">
              {t('badges.ordinal', { ordinal })}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 bg-white/70 dark:bg-zinc-900/60 backdrop-blur">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {t('fields.caseNumber')}
            </dt>
            <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100 break-words">
              {normalizeDisplay(caseNumber ?? '')}
            </dd>
          </div>

          <div className="sm:col-span-9">
            <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {t('fields.caseName')}
            </dt>
            <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100 break-words">
              {normalizeDisplay(caseName ?? '')}
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-zinc-200/70 dark:border-zinc-800" />
      </div>
    </div>
  );
}

export default function EvidenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations('EvidenceDetail');
  const tE = useTranslations('Evidences');
  const { id } = use(params);
  const numericId = Number(id);

  const { data, error, loading } = useQuery(GET_EVIDENCE_BY_ID, {
    variables: { id: numericId },
  });

  if (loading) {
    // 簡單 skeleton
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border bg-zinc-50/60 dark:bg-zinc-900/50 border-zinc-200/70 dark:border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 mx-6">
        <div className="rounded-2xl border border-red-300/60 bg-red-50/70 dark:bg-red-900/20 dark:border-red-800 text-red-700 dark:text-red-300 px-5 py-4">
          {t('error.generic')}: {String(error.message)}
        </div>
      </div>
    );
  }

  const c = data.evidence;

  // --- 計算「第 N 件」：依 createdAt 升冪排序，再找目前證物的索引 ---
  const evidencesInSameCase = Array.isArray(c.case?.evidences)
    ? [...c.case.evidences].filter((e: any) => e && e.createdAt)
    : [];

  evidencesInSameCase.sort(
    (a: any, b: any) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const currentIndex = evidencesInSameCase.findIndex(
    (e: any) => Number(e.id) === Number(c.id)
  );
  const ordinal = currentIndex !== -1 ? currentIndex + 1 : 'N/A';

  const isPickupText = c.is_Pickup ? t('cells.picked') : t('cells.unpicked');

  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900 min-h-[calc(100dvh-64px)]">
      {/* 頁首：標題 + 操作 */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <p className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t('header.title', { number: normalizeDisplay(c.evidenceNumber) })}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-base text-zinc-600 dark:text-zinc-300">
              {t('toolbar.toggleLabel')}
            </span>
            <ModeToggle />
          </div>
          <Button asChild variant="outline">
            <Link href={`/evidence/${id}/edit`}>{t('actions.edit')}</Link>
          </Button>
          <Button asChild>
            <Link href={`/case/${c.case.id}`}>{t('actions.backToCase')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/evidence">{t('actions.backToList')}</Link>
          </Button>
        </div>
      </div>

      {/* 案件資訊卡片 */}
      <CaseSummaryCard
        caseNumber={c.case?.caseNumber}
        caseName={c.case?.caseName}
        ordinal={ordinal}
      />

      {/* 區塊一：基本資訊（交付證物給鑑識人員） */}
      <section className="rounded-2xl border bg-white/70 dark:bg-zinc-900/60 backdrop-blur p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          {t('sections.basic')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <Info label={t('fields.evidenceNumber')} value={c.evidenceNumber} />
          <Info label={t('fields.evidenceType')} value={c.evidenceType} />
          <Info label={t('fields.evidenceBrand')} value={c.evidenceBrand} />
          <Info label={t('fields.evidenceSerialNo')} value={c.evidenceSerialNo} />
          <Info label={t('fields.evidenceOriginalNo')} value={c.evidenceOriginalNo} />
          <Info label={t('fields.deliveryName')} value={c.deliveryName} />
          <Info label={t('fields.receiverName')} value={c.receiverName} />
        </div>
      </section>

      {/* 區塊二：照片（接收與領回） */}
      <section className="rounded-2xl border bg-white/70 dark:bg-zinc-900/60 backdrop-blur p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          {t('sections.photos')}
        </h3>

        {!(c.photoFront || c.photoBack || c.photoFront2 || c.photoBack2) ? (
          <div className="text-sm text-muted-foreground">{t('photos.empty')}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {c.photoFront && (
              <div>
                <div className="text-sm mb-1 text-muted-foreground">{t('photos.frontReceive')}</div>
                <img
                  src={c.photoFront}
                  alt={t('photos.frontAlt')}
                  className="w-full h-auto rounded-xl object-contain bg-black/5"
                />
              </div>
            )}
            {c.photoBack && (
              <div>
                <div className="text-sm mb-1 text-muted-foreground">{t('photos.backReceive')}</div>
                <img
                  src={c.photoBack}
                  alt={t('photos.backAlt')}
                  className="w-full h-auto rounded-xl object-contain bg-black/5"
                />
              </div>
            )}
            {c.photoFront2 && (
              <div>
                <div className="text-sm mb-1 text-muted-foreground">{t('photos.frontReturn')}</div>
                <img
                  src={c.photoFront2}
                  alt={t('photos.front2Alt')}
                  className="w-full h-auto rounded-xl object-contain bg-black/5"
                />
              </div>
            )}
            {c.photoBack2 && (
              <div>
                <div className="text-sm mb-1 text-muted-foreground">{t('photos.backReturn')}</div>
                <img
                  src={c.photoBack2}
                  alt={t('photos.back2Alt')}
                  className="w-full h-auto rounded-xl object-contain bg-black/5"
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* 區塊三：鑑識與退件狀態（返回證物給原單位） */}
      <section className="rounded-2xl border bg-white/70 dark:bg-zinc-900/60 backdrop-blur p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          {t('sections.status')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <Info label={t('fields.is_beyond_scope')} value={c.is_beyond_scope} />
          <Info label={t('fields.is_lab_related')} value={c.is_lab_related} />
          <Info label={t('fields.is_info_complete')} value={c.is_info_complete} />
          <Info label={t('fields.is_rejected')} value={c.is_rejected} />
          <Info label={t('fields.deliveryName2')} value={c.deliveryName2} />
          <Info label={t('fields.receiverName2')} value={c.receiverName2} />
          <Info
            label={t('fields.is_Pickup')}
            value={isPickupText}
            className="sm:col-span-2 xl:col-span-1"
          />
        </div>
      </section>

      {/* 監管鏈與列印 */}
      <section className=" flex justify-around rounded-2xl border bg-white/70 dark:bg-zinc-900/60 backdrop-blur p-6 space-y-4 shadow-sm">
       <div className=' text-center p-3'>
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-3">
          {t('sections.chain')}
        </h3>
        <Button asChild>
          <Link
            href={`/evidence/${id}/print`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('actions.print')}
          </Link>
        </Button>
        </div>
        <div className=' text-center p-3'>
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-3">
          {t('sections.formForTest')}
        </h3>
        <Button asChild variant='destructive'>
          <Link
            href={`/evidence/${id}/printTester`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('actions.print')}
          </Link>
        </Button>
        </div>
        <div className=' text-center p-3'>
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-3">
          {t('sections.formForOrig')}
        </h3>
        <Button asChild variant='secondary'>
          <Link
            href={`/evidence/${id}/printBack`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('actions.print')}
          </Link>
        </Button>
        </div>
      </section>

      {/* 區塊四：建立時間 */}
      <section className="rounded-2xl border bg-white/70 dark:bg-zinc-900/60 backdrop-blur p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
          {t('sections.created')}
        </h3>
        <Info label={t('fields.createdAt')} value={c.createdAt} />
      </section>
    </div>
  );
}
