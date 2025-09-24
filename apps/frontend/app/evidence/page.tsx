'use client'
import { useQuery,useMutation } from "@apollo/client"
import { GET_ALL_EVIDENCES } from "@/lib/graphql/EvidenceGql"
import { REMOVE_EVIDENCE } from "@/lib/graphql/EvidenceGql"
import { ME_QUERY } from '@/lib/graphql/UserGql';
import { EvidenceDataTable } from "@/components/evidence/data-table"
import EvidenceToolbar from "@/components/evidence/toolbar"
import { EvidenceColumns as makeColumns,EvidenceRow } from "@/components/evidence/columns"
import { useState } from "react"

const normalizeRole = (v?: string | null) =>
  String(v).toLowerCase() === 'admin' ? 'admin' : 'user';

const EvidenceHomePage = () => {
  const {data,error,loading}=useQuery(GET_ALL_EVIDENCES,{
      fetchPolicy: 'cache-and-network'
  });

  // 2) 取當前使用者（判斷 isAdmin）
  const { data: meData } = useQuery(ME_QUERY, { fetchPolicy: 'cache-first' });
  const me = meData?.me;
  const isAdmin = normalizeRole(me?.role) === 'admin';
  console.log('Admin是:',isAdmin)

  const [removeEvidence]=useMutation(REMOVE_EVIDENCE);
  const [q,setQ]=useState('');
  const list: EvidenceRow[] = data?.evidences ?? [];
  const keyword=q.trim().toLowerCase()
  const rows:EvidenceRow[]=keyword
     ? list.filter((it:any)=>
      [it.evidenceNumber,
        it.evidenceBrand,
        it.evidenceOriginalNo,
        it.deliveryName,
        it.receiverName,
        it.evidenceType].some((f: string) => (f ?? '').toLowerCase().includes(keyword))                 
    ):list

  async function handleDelete(id:number){
        const ok = confirm('確定要刪除此證物資料嗎?');
        if(!ok) return 
        await removeEvidence({
            variables:{id},
            refetchQueries:[
               GET_ALL_EVIDENCES,
            ],
            update(cache){
              cache.modify({
              fields: {
                cases(existingRefs = [], { readField }) {
                  return existingRefs.filter((ref: any) => readField('id', ref) !== id);
                },
              },
            });
            }
        })
        alert('刪除成功');
  }

  const columns=makeColumns(isAdmin,handleDelete)
  if(loading) return <div>載入中</div>
  if(error) return <div>錯誤:{String(error.message)}</div>

  return (
    <div className="p-4">
          <EvidenceToolbar value={q} onChange={setQ} isAdmin={isAdmin}/>
          <EvidenceDataTable columns={columns} data={rows}/>
        </div>
  )
}

export default EvidenceHomePage