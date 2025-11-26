'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_CAESE, REMOVE_CASE } from '@/lib/graphql/CaseGql';
import { ME_QUERY } from '@/lib/graphql/UserGql';

import { DataTable } from '@/components/cases/data-table';
import CasesToolbar from '@/components/cases/toolbar';
import { columns as makeCaseColumns, type CaseRow } from '@/components/cases/columns';

const normalizeRole = (v?: string | null) =>
  String(v).toLowerCase() === 'admin' ? 'admin' : 'user';

export default function CasePage() {
  // 1) 取案件清單
  const { data, error, loading } = useQuery(GET_ALL_CAESE, {
    fetchPolicy: 'cache-and-network',
  });

  // 2) 取當前使用者（判斷 isAdmin）
  const { data: meData } = useQuery(ME_QUERY, { fetchPolicy: 'cache-first' });
  const me = meData?.me;
  const isAdmin = normalizeRole(me?.role) === 'admin';
  console.log('Admin是:',isAdmin)

  // 3) 刪除 mutation
  const [removeCase] = useMutation(REMOVE_CASE);

  // 4) 本地關鍵字過濾
  const [q, setQ] = useState('');
  const list: CaseRow[] = data?.cases ?? [];
  const rows: CaseRow[] = q.trim()
    ? list.filter((it) =>
        [it.caseNumber, it.caseName, it.submitUnit, it.submitterName, (it as any).Creator_Name, it.caseType]
          .some((f: string) => (f ?? '').toLowerCase().includes(q.trim().toLowerCase()))
      )
    : list;

  // 5) 刪除（前端再保護一次）
  async function handleDelete(id: number) {
    if (!isAdmin) {
      alert('您沒有刪除權限。');
      return;
    }
    const ok = confirm('刪除後與該案件的證物紀錄也會一併刪除，確定要刪除嗎？');
    if (!ok) return;

    await removeCase({
      variables: { id },
      update(cache) {
        cache.modify({
          fields: {
            cases(existingRefs = [], { readField }) {
              return existingRefs.filter((ref: any) => readField('id', ref) !== id);
            },
          },
        });
      },
    });
    alert('刪除成功');
  }

  // 6) 由頁面把 isAdmin 與 onDelete 傳進 columns
  const columns = makeCaseColumns({ isAdmin, onDelete: handleDelete });

  if (loading) return <div className="p-4">載入中…</div>;
  if (error) return <div className="p-4">錯誤：{String(error.message)}</div>;

  return (
    <div className="p-4 space-y-4">
      <CasesToolbar value={q} onChange={setQ} isAdmin={isAdmin}/>
      <DataTable<CaseRow, unknown> columns={columns} data={rows} />
    </div>
  );
}
