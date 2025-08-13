'use client'
import { useQuery } from '@apollo/client';
import { GET_CASE_BY_ID } from '@/lib/graphql/CaseGql';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-muted-foreground text-sm">{label}</div>
      <div className="font-medium">{value ?? '-'}</div>
    </div>
  );
}

export default function CaseDetailPage({params}:{params:{id:string}}){
       const id = Number(params.id)
       const {data,loading,error} = useQuery(GET_CASE_BY_ID,{variables:{id}})
       if (loading) return <div>載入中…</div>;
       if (error) return <div>錯誤：{String(error.message)}</div>;

       const c = data.case;

       return (
          <div className="p-4 space-y-4">
             <div className='flex justify-between'>
                 <h1 className="text-xl font-semibold">案件：{c.caseNumber}</h1>
                 <div className='flex gap-2'>
                     <Button asChild variant="outline">
                         <Link href={`/case/${id}/edit`}>編輯</Link>
                     </Button>
                     <Button asChild>
                         <Link href='/case'>返回列表</Link>
                     </Button>
                 </div>
             </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Info label="案件摘要" value={c.caseName} />
                  <Info label="案件類型" value={c.caseType} />
                  <Info label="送件單位" value={c.submitUnit} />
                  <Info label="送件人姓名" value={c.submitterName} />
                  <Info label="手機" value={c.submitterPhone} />
                  <Info label="市話" value={c.submitterTel} />
                  <Info label="年度" value={String(c.year)} />
                  <Info label="冠字" value={c.prefixLetter} />
                  <Info label="股別" value={c.section} />
                  <Info label="建立時間" value={c.createdAt} />
           </div>
          </div>
       )
}