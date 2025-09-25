'use client';

import { use, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_EVIDENCE_BY_ID } from '@/lib/graphql/EvidenceGql';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function twDateTime(s?: string) {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString('zh-TW', { hour12: false });
}

export default function EvidencePrintPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const eid = Number(id);

  const { data, loading, error } = useQuery(GET_EVIDENCE_BY_ID, {
    variables: { id: eid },
  });

  // 自動叫出列印（等資料載好再印）
  useEffect(() => {
    if (!loading && !error && data?.evidence) {
      const t = setTimeout(() => window.print(), 300);
      return () => clearTimeout(t);
    }
  }, [loading, error, data]);

  if (loading) return <div className="p-6">載入中…</div>;
  if (error) return <div className="p-6">錯誤：{String(error.message)}</div>;

  const e = data.evidence;

  // 只預填「收件」那一列，其餘留白給人工簽填
  const rows = [
    {
      datetime: twDateTime(e.createdAt),
      deliverer: e.deliveryName ?? '',
      receiver: e.receiverName ?? '',
      reason: '收件',
    },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
  ];

  return (
    <div
      className="min-h-screen bg-neutral-50 text-slate-900 p-4 print:p-0"
      style={{ fontFamily: 'DFKai-sb, "標楷體", serif' }} // ✅ 全頁標楷體
    >
      {/* 工具列（列印隱藏） */}
      <div className="toolbar print:hidden mb-4 flex gap-2">
        <Button asChild variant="outline">
          <Link href={`/evidence/${id}`}>返回證物頁</Link>
        </Button>
        <Button onClick={() => window.print()}>再次列印</Button>
      </div>

      {/* A4 版心 */}
      <div className="a4 avoid-break mx-auto max-w-[794px] bg-white p-6 shadow-sm">
        <h1 className="doc-title mb-4 text-center text-2xl font-bold">證物監管鏈紀錄表</h1>

        {/* ✅ info-bar 置中 */}
        <div className="info-bar flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mb-4 text-base">
          <div className="info-item">
            證物編號：<b>{e.evidenceNumber}</b>
          </div>
          <div className="info-item">
            案件編號：<b>{e.case?.caseNumber ?? ''}</b>
          </div>
          <div className="info-item">
            案件名稱：<b>{e.case?.caseName ?? ''}</b>
          </div>
        </div>

        {/* 表格（A4 友善） */}
        <table className="table-clean table-sticky w-full border-collapse">
          <thead>
            <tr>
              <th className="w-[22%] border px-2 py-2 text-left">日期時間</th>
              <th className="w-[26%] border px-2 py-2 text-left">交付人員</th>
              <th className="w-[26%] border px-2 py-2 text-left">接收人員</th>
              <th className="w-[26%] border px-2 py-2 text-left">移轉原因／備註（出／入／簽證）</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="row-tall border px-2 py-3">{r.datetime}</td
                >
                <td className="border px-2 py-3">{r.deliverer}</td>
                <td className="border px-2 py-3">{r.receiver}</td>
                <td className="border px-2 py-3">{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="doc-footnote mt-4 text-right text-sm">
          表單編號：DFL-4-12-15（1.1）
        </div>
      </div>

      {/* 可選的列印專用樣式（若 Tailwind 未涵蓋） */}
      <style jsx>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .a4 {
            width: 210mm;
            min-height: 297mm;
            box-shadow: none !important;
            padding: 12mm !important;
          }
        }
      `}</style>
    </div>
  );
}
