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
      // 小延遲避免字體/樣式未就緒
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
    // 這些空列保留手寫：移交給鑑識、鑑識後移交、返還原單位…等
    { datetime: '', deliverer: '', receiver: '', reason: '' },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
  ];

  return (
   <div className="min-h-screen bg-neutral-50 text-slate-900 p-4 print:p-0">
    {/* 工具列（列印隱藏） */}
    <div className="toolbar">
      <Button asChild variant="outline">
        <Link href={`/evidence/${id}`}>返回證物頁</Link>
      </Button>
      <Button onClick={() => window.print()}>再次列印</Button>
    </div>

    {/* A4 版心 */}
    <div className="a4 avoid-break">
      <h1 className="doc-title">證物監管鏈紀錄表</h1>

      {/* 上方基本資訊條 */}
      <div className="info-bar">
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
      <table className="table-clean table-sticky">
        <thead>
          <tr>
            <th className="w-[22%]">日期時間</th>
            <th className="w-[26%]">交付人員</th>
            <th className="w-[26%]">接收人員</th>
            <th className="w-[26%]">移轉原因／備註（出／入／簽證）</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="row-tall">{r.datetime}</td>
              <td>{r.deliverer}</td>
              <td>{r.receiver}</td>
              <td>{r.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="doc-footnote">
        表單編號：DFL-4-12-15（1.1）
      </div>
    </div>
  </div>
  );
}
