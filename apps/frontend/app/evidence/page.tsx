'use client';
import { useQuery, useMutation } from "@apollo/client";
import { GET_ALL_EVIDENCES, REMOVE_EVIDENCE } from "@/lib/graphql/EvidenceGql";
import { ME_QUERY } from '@/lib/graphql/UserGql';
import { EvidenceDataTable } from "@/components/evidence/data-table";
import EvidenceToolbar from "@/components/evidence/toolbar";
import { EvidenceColumns, EvidenceRow } from "@/components/evidence/columns";
import { useState } from "react";


type EvidenceRowWithGroup = EvidenceRow & { groupKey: string };

const normalizeRole = (v?: string | null) =>
  String(v).toLowerCase() === 'admin' ? 'admin' : 'user';


const extractGroupKey = (evidenceNumber: string) =>
  evidenceNumber.split('-').slice(0, 2).join('-'); // 例：EVID-2025090001

// 產生對應顏色 Map
const generateColorMap = (keys: string[]) => {
 const palette = [
      'bg-red-100',
    'bg-green-100',
    'bg-blue-100',
    'bg-amber-100',
    'bg-violet-100',
    'bg-cyan-100',
    'bg-orange-100',
    'bg-rose-100',
    'bg-lime-100',
    'bg-slate-100',
    'bg-teal-100',
    'bg-pink-100',
  ];
  const map: Record<string, string> = {};
  keys.forEach((key, idx) => {
    map[key] = palette[idx % palette.length];
  });
  return map;
};

const EvidenceHomePage = () => {
  const { data, error, loading } = useQuery(GET_ALL_EVIDENCES, {
    fetchPolicy: 'cache-and-network',
  });
//   console.log('所有的證物內容是:',data?.evidences)
//   const allEvidenceArray: EvidenceRow[] = data?.evidences ?? [];

//  const pickedUpEvidences = allEvidenceArray.filter(item => item.is_Pickup === true);


//   console.log('全部已領回的證物是:',pickedUpEvidences)

  const { data: meData } = useQuery(ME_QUERY, { fetchPolicy: 'cache-first' });
  const me = meData?.me;
  const isAdmin = normalizeRole(me?.role) === 'admin';

  const [removeEvidence] = useMutation(REMOVE_EVIDENCE);
  const [q, setQ] = useState('');

  const list: EvidenceRow[] = data?.evidences ?? [];
  const keyword = q.trim().toLowerCase();

  const filteredRows: EvidenceRow[] = keyword
    ? list.filter((it: any) =>
        [it.evidenceNumber, it.evidenceBrand, it.evidenceOriginalNo, it.deliveryName, it.receiverName, it.evidenceType]
          .some((f: string) => (f ?? '').toLowerCase().includes(keyword))
      )
    : list;

  // enrich rows with groupKey
  const enrichedRows: EvidenceRowWithGroup[] = filteredRows.map((row) => ({
    ...row,
    groupKey: extractGroupKey(row.evidenceNumber),
  }));

  const uniqueGroupKeys = Array.from(new Set(enrichedRows.map((r) => r.groupKey)));
  const groupColorMap = generateColorMap(uniqueGroupKeys);

  const handleDelete = async (id: number) => {
    const ok = confirm('確定要刪除此證物資料嗎?');
    if (!ok) return;
    await removeEvidence({
      variables: { id },
      refetchQueries: [GET_ALL_EVIDENCES],
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
  };

  // 🔥 注意這裡傳入 EvidenceRowWithGroup
  const columns = EvidenceColumns<EvidenceRowWithGroup>(isAdmin, handleDelete);

  if (loading) return <div>載入中</div>;
  if (error) return <div>錯誤: {String(error.message)}</div>;

  return (
    <div className="p-4">
      <EvidenceToolbar value={q} onChange={setQ} isAdmin={isAdmin} />
      <EvidenceDataTable<EvidenceRowWithGroup, unknown>
        columns={columns}
        data={enrichedRows}
        groupColorMap={groupColorMap}
      />
    </div>
  );
};

export default EvidenceHomePage;
