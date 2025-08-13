'use client' 
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export type EvidenceLite = {
      id: number;
      evidenceNumber?: string | null;
      evidenceType?: string | null;
};

export type CaseRow = {
      id: number;
      caseName: string;
      caseNumber: string;
      caseType: string;
      createdAt: string;
      evidences: EvidenceLite[];     
      prefixLetter: string;
      section: string;
      submitUnit: string;
      submitterName: string;
      submitterPhone: string;
      submitterSignature: string;   
      submitterTel: string;
      year: number;
}

export const columns=(onDelete:(id:number)=>void):ColumnDef<CaseRow>[]=>{
      return [
      {accessorKey: 'caseNumber', header: '案件編號'},
      {accessorKey:'caseType',header:'案件類型'},
      {accessorKey: 'caseName', header: '案件名稱'},
      {accessorKey: 'submitUnit', header: '送件單位'},
      {accessorKey:'submitterName', header: '送件人名'},
      {accessorKey:'createdAt', header:'建立時間'},
      {
            id: 'actions',
            header:() => <div className="text-center">操作</div>,
            cell: ({ row }) => {
                  const id = Number(row.original.id);
                  return (
                  <div className="flex gap-2">
                  <Button asChild variant="secondary" size="sm">
                        <Link href={`/case/${id}`}>查看詳細</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                        <Link href={`/cases/${id}/edit`}>編輯</Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(id)}>
                        刪除
                  </Button>
                  </div>
                  );
            },
      },
  ]
}
