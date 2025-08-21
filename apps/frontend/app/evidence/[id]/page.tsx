'use client';

import { use } from 'react';
import { useQuery } from '@apollo/client';
import { GET_EVIDENCE_BY_ID } from '@/lib/graphql/EvidenceGql';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';

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

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | boolean | Date | null;
}) {
  const displayValue = normalizeDisplay(value);

  return (
    <div className="rounded-xl border bg-white/60 p-4 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800/60 transition-colors">
      <div className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
        {label}
      </div>
      <div className="text-base font-semibold text-gray-900 dark:text-gray-100 break-words">
        {displayValue}
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
  return (
    <div className="w-full rounded-2xl border bg-gradient-to-b from-white to-gray-50 p-0 shadow-lg dark:from-gray-900 dark:to-gray-850 dark:border-gray-700 transition-colors">
      <div className="flex items-center justify-between rounded-t-2xl border-b px-6 py-4 dark:border-gray-700">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          案件資訊
        </h2>
        <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700/50 bg-teal-50 dark:bg-teal-900/20">
          {`此證物為此案件的第 ${ordinal} 件`}
        </span>
      </div>

      <div className="px-6 py-5">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
              案件編號
            </dt>
            <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100 break-words">
              {normalizeDisplay(caseNumber ?? '')}
            </dd>
          </div>

          <div className="sm:col-span-9">
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
              案件名稱
            </dt>
            <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100 break-words">
              {normalizeDisplay(caseName ?? '')}
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t dark:border-gray-700" />
      </div>
    </div>
  );
}

export default function EvidenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const numericId = Number(id);

  const { data, error, loading } = useQuery(GET_EVIDENCE_BY_ID, {
    variables: { id: numericId },
  });

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-700 dark:text-gray-200">
        載入中…
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-600 dark:text-red-400">
        錯誤：{String(error.message)}
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

  // 顯示「是否已領回」
  const isPickupText = c.is_Pickup ? '已領回' : '尚未領回';

  return (
    <div className="p-6 space-y-6 bg-white text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100">
      {/* 頁首：標題 + 操作 */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <p className="text-2xl md:text-3xl font-semibold tracking-tight">
          {`證物編號：${normalizeDisplay(c.evidenceNumber)}`}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-base">點擊轉換模式</span>
            <ModeToggle />
          </div>
          <Button asChild variant="outline">
            <Link href={`/evidence/${id}/edit`}>編輯</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/evidence">返回列表</Link>
          </Button>
        </div>
      </div>
      {/* 優化後：案件資訊卡片 */}
      <CaseSummaryCard
        caseNumber={c.case?.caseNumber}
        caseName={c.case?.caseName}
        ordinal={ordinal}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Info label="證物交付者" value={c.deliveryName} />
        <Info label="接收證物鑑識人員" value={c.receiverName} />
        <Info label="證物編號" value={c.evidenceNumber} />
        <Info label="證物類型" value={c.evidenceType} />
        <Info label="證物廠牌" value={c.evidenceBrand} />
        <Info label="證物廠牌序號" value={c.evidenceSerialNo} />
        <Info label="原始證物編號" value={c.evidenceOriginalNo} />
        {/* 如需顯示照片可將 GraphQL 查詢補上 photoFront/photoBack，並自訂圖片卡片樣式 */}
        <Info label="鑑識後是否已領回" value={isPickupText} />
        <Info label="建立時間" value={c.createdAt} />
      </div>
    </div>
  );
}
