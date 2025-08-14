'use client';
import { use } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CASE_BY_ID } from '@/lib/graphql/CaseGql';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="mb-2 mt-2 p-4 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 transition-colors">
      <div className="text-xl font-bold text-teal-900 dark:text-teal-300 mb-1">{label}</div>
      <div className="font-medium text-base text-gray-700 dark:text-gray-300">{value ?? '-'}</div>
    </div>
  );
}

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const numericId = Number(id);
  const { data, loading, error } = useQuery(GET_CASE_BY_ID, { variables: { id: numericId } });
  if (loading) return <div className="text-center py-8 text-gray-700 dark:text-gray-200">載入中…</div>;
  if (error) return <div className="text-center py-8 text-red-500 dark:text-red-400">錯誤：{String(error.message)}</div>;

  const c = data.case;

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-3xl font-semibold">{`案件編號：${c.caseNumber}`}</p>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">點擊轉換模式</span>
            <ModeToggle />
          </div>
          <Button asChild variant="outline">
            <Link href={`/case/${id}/edit`}>編輯</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/case">返回列表</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
        <Info label="年度" value={String(c.year)} />
        <Info label="案件類型" value={c.caseType} />
        <Info label="案件摘要" value={c.caseName} />
        <Info label="送件單位" value={c.submitUnit} />
        <Info label="股別" value={c.section} />
        <Info label="冠字" value={c.prefixLetter} />
        <Info label="送件人姓名" value={c.submitterName} />
        <Info label="手機" value={c.submitterPhone} />
        <Info label="市話" value={c.submitterTel} />
        <Info label="建立時間" value={c.createdAt} />
      </div>

      <div className="w-full p-6 rounded-lg shadow-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors">
        <p className="font-semibold text-2xl text-center mb-4">此案證物共 {c.evidences?.length} 件</p>
        <ul className="space-y-4">
          {c.evidences?.map((e: any) => (
            <li
              key={e.id}
              className="p-4 border rounded-md bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex flex-col sm:flex-row justify-around items-center text-sm sm:text-base">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  證物編號：<span className="font-bold">{e.evidenceNumber}</span>
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  證物類型：<span className="font-bold">{e.evidenceType}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
