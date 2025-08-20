'use client';

import { use } from 'react';
import { useQuery } from '@apollo/client';
import { GET_EVIDENCE_BY_ID } from '@/lib/graphql/EvidenceGql';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';

// 優化後的 Info component，能更好地處理不同類型的資料顯示
function Info({ label, value }: { label: string; value?: string | boolean | Date | null }) {
  let displayValue: string;
  if (value instanceof Date) {
    displayValue = value.toLocaleDateString(); // 格式化 Date 物件
  } else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)) {
    // 處理 ISO 格式的日期字串，轉換為本地化日期
    displayValue = new Date(value).toLocaleDateString();
  } else if (typeof value === 'boolean') {
    displayValue = value ? '是' : '否'; // 轉換布林值
  } else if (value === null || value === undefined || value.trim() === '') {
    displayValue = '-'; // 處理 null, undefined, 或空字串
  } else {
    displayValue = value; // 顯示其他字串值
  }

  return (
    <div className="mb-2 mt-2 p-4 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 transition-colors">
      <div className="text-xl font-bold text-teal-900 dark:text-teal-300 mb-1">{label}</div>
      <div className="font-medium text-base text-gray-700 dark:text-gray-300">{displayValue}</div>
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

  if (loading)
    return (
      <div className="text-center py-8 text-gray-700 dark:text-gray-200">載入中…</div>
    );

  if (error)
    return (
      <div className="text-center py-8 text-red-500 dark:text-red-400">
        錯誤：{String(error.message)}
      </div>
    );

  const c = data.evidence;

  // --- 計算「第 N 件」：依 createdAt 升冪排序，再找目前證物的索引 ---
  // 為了保險起見，複製陣列並過濾無效值，確保排序和查找的正確性
  const evidencesInSameCase =
    Array.isArray(c.case?.evidences) ? 
      [...c.case.evidences].filter(e => e && e.createdAt) : 
      [];

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
    <div className="p-6 space-y-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-3xl font-semibold">{`證物編號：${c.evidenceNumber}`}</p>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">點擊轉換模式</span>
            <ModeToggle />
          </div>
          {/* 編輯按鈕：指向證物的編輯頁面 */}
          <Button asChild variant="outline">
            <Link href={`/evidence/${id}/edit`}>編輯</Link>
          </Button>
          {/* 返回列表按鈕：指向證物列表頁面 */}
          <Button asChild variant="outline">
            <Link href="/evidence">返回列表</Link>
          </Button>
        </div>
      </div>

      {/* 優化後的案件資訊區塊 */}
      <div className="w-full p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">案件資訊</h2>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center text-lg">
            <span className="font-semibold text-gray-600 dark:text-gray-300 sm:w-28 flex-shrink-0">案件編號：</span>
            <span className="text-gray-800 dark:text-gray-100 break-words mt-1 sm:mt-0">{c.case.caseNumber}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center text-lg">
            <span className="font-semibold text-gray-600 dark:text-gray-300 sm:w-28 flex-shrink-0">案件名稱：</span>
            <span className="text-gray-800 dark:text-gray-100 break-words mt-1 sm:mt-0">{c.case.caseName}</span>
          </div>
        </div>

        {/* 證物在案件中的順序，加上更顯眼的樣式 */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <span className="text-lg md:text-xl font-bold text-teal-700 dark:text-teal-400">
            {`此證物為此案件的第 ${ordinal} 件證物`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
        <Info label="證物交付者" value={c.deliveryName} />
        <Info label="接收證物鑑識人員" value={c.receiverName} />
        <Info label="證物編號" value={c.evidenceNumber} />
        <Info label="證物類型" value={c.evidenceType} />
        <Info label="證物廠牌" value={c.evidenceBrand} />
        <Info label="證物廠牌序號" value={c.evidenceSerialNo} />
        <Info label="原始證物編號" value={c.evidenceOriginalNo} />
        {/* photoFront 和 photoBack 在你的 GraphQL 查詢中沒有被獲取，所以在此移除 */}
        {/* <Info label="證物正面照" value={c.photoFront} /> */}
        {/* <Info label="證物反面照" value={c.photoBack} /> */}
        <Info label="鑑識後是否已領回" value={isPickupText} />
        <Info label="建立時間" value={c.createdAt} /> {/* Info component 已優化以處理日期格式 */}
      </div>
    </div>
  );
}
