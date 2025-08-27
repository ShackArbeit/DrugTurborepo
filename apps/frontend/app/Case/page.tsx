'use client'
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_CAESE } from '@/lib/graphql/CaseGql';
import { REMOVE_CASE } from '@/lib/graphql/CaseGql';
import { DataTable } from '@/components/cases/data-table';
import CasesToolbar from '@/components/cases/toolbar';
import {columns as makeColumns, CaseRow} from '../../components/cases/columns'
import {useState} from 'react'


export default function CasePage() {
     const {data,error,loading}=useQuery(GET_ALL_CAESE,{
         fetchPolicy: 'cache-and-network'
     })
     const [removeCase] = useMutation(REMOVE_CASE);
     const [q, setQ] = useState('');
     
  const list: CaseRow[] = data?.cases ?? [];
  const keyword = q.trim().toLowerCase();
  const rows: CaseRow[] = keyword
    ? list.filter((it: any) =>
        [it.caseNumber, it.caseName, it.submitUnit, it.submitterName,it.Creator_Name,it.caseType]
          .some((f: string) => (f ?? '').toLowerCase().includes(keyword))
      )
    : list;

  async function handleDelete(id: number) {
    const ok = confirm('刪除後與該案件的證物紀錄也會一併刪除，確定要刪除嗎?');
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

  // 3) 每次 render 建立 columns 也沒關係；
  const columns = makeColumns(handleDelete);

    //  const rows: CaseRow[] = useMemo(() => {
    //        const list = data?.cases ?? [];
    //        if (!q.trim()) {return list;
    //         } else {
    //           const v = q.trim().toLowerCase();  
    //           return list.filter((it: any) =>
    //             [it.caseNumber, it.caseName, it.submitUnit, it.submitterName]
    //               .some((f: string) => (f ?? '').toLowerCase().includes(v))
    //           );
    //         }
    //      }, [data, q]);
    //   const columns = useMemo(() => makeColumns(async (id: number) => {
    //           const ok = confirm('確定刪除？');
    //           if (ok) {
    //             await removeCase({
    //               variables: { id },
    //               update(cache) {
    //                 cache.modify({
    //                   fields: {
    //                     cases(existingRefs = [], { readField }) {
    //                       return existingRefs.filter((ref: any) => readField('id', ref) !== id);
    //                     }
    //                   }
    //                 });
    //               },
    //             });
    //             alert('刪除成功');
    //           } else {
    //                return;
    //           }
    //   }), [removeCase]);
      if(loading) return <div>載入中</div>
      if(error) return <div>錯誤:{String(error.message)}</div>
     
  return (
      <div className="p-4">
          <CasesToolbar value={q} onChange={setQ}/>
          <DataTable columns={columns} data={rows}/>
      </div>
   )
 
}