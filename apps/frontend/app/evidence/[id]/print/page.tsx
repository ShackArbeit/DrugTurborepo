'use client';

import { use, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_EVIDENCE_BY_ID } from '@/lib/graphql/EvidenceGql';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

function formatDateTime(s?: string, locale?: string) {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString(locale, { hour12: false });
}

export default function EvidencePrintPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const t = useTranslations('EvidencePrint');
  const locale = useLocale();

  const { id } = use(params);
  const eid = Number(id);

  const { data, loading, error } = useQuery(GET_EVIDENCE_BY_ID, {
    variables: { id: eid },
  });

  // 自動叫出列印（等資料載好再印）
  useEffect(() => {
    if (!loading && !error && data?.evidence) {
      const tmr = setTimeout(() => window.print(), 300);
      return () => clearTimeout(tmr);
    }
  }, [loading, error, data]);

  if (loading) return <div className="p-6">{t('loading')}</div>;
  if (error) return <div className="p-6">{t('error', { message: String(error.message) })}</div>;

  const e = data.evidence;

  // 只預填「收件」那一列，其餘留白給人工簽填
  const rows = [
    {
      datetime: formatDateTime(e.createdAt, locale),
      deliverer: e.deliveryName ?? '',
      receiver: e.receiverName ?? '',
      reason: t('rows.receiveReason'),
    },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
    { datetime: '', deliverer: '', receiver: '', reason: '' },
  ];

  const footnoteCode = 'DFL-4-12-15 (1.1)';

  return (
    <div
      className="min-h-screen bg-neutral-50 text-slate-900 p-4 print:p-0"
      style={{ fontFamily: 'DFKai-sb, "標楷體", serif' }}
    >
      {/* 工具列（列印隱藏） */}
      <div className="toolbar print:hidden mb-4 flex gap-2">
        <Button asChild variant="outline">
          <Link href={`/evidence/${id}`}>{t('toolbar.backToEvidence')}</Link>
        </Button>
        <Button onClick={() => window.print()}>{t('toolbar.printAgain')}</Button>
      </div>

      {/* A4 版心 */}
      <div className="a4 avoid-break mx-auto max-w-[794px] bg-white p-6 shadow-sm">
        <h1 className="doc-title mb-4 text-center text-2xl font-bold">{t('title')}</h1>

        {/* info-bar 置中 */}
        <div className="info-bar flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mb-4 text-base">
          <div className="info-item">
            {t('info.evidenceNumber')}：<b>{e.evidenceNumber}</b>
          </div>
          <div className="info-item">
            {t('info.caseNumber')}：<b>{e.case?.caseNumber ?? ''}</b>
          </div>
          <div className="info-item">
            {t('info.caseName')}：<b>{e.case?.caseName ?? ''}</b>
          </div>
        </div>

        {/* 表格（A4 友善） */}
        <table className="table-clean table-sticky w-full border-collapse">
          <thead>
            <tr>
              <th className="w-[22%] border px-2 py-2 text-left">{t('table.headers.datetime')}</th>
              <th className="w-[26%] border px-2 py-2 text-left">{t('table.headers.deliverer')}</th>
              <th className="w-[26%] border px-2 py-2 text-left">{t('table.headers.receiver')}</th>
              <th className="w-[26%] border px-2 py-2 text-left">{t('table.headers.reasonNote')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="row-tall border px-2 py-3">{r.datetime}</td>
                <td className="border px-2 py-3">{r.deliverer}</td>
                <td className="border px-2 py-3">{r.receiver}</td>
                <td className="border px-2 py-3">{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="doc-footnote mt-4 text-right text-sm">
          {t('footnote', { code: footnoteCode })}
        </div>
      </div>

      {/* 列印專用樣式 */}
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
