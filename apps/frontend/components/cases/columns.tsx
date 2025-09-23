'use client';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import router from 'next/router';

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
};

export const columns = (opts: {
  isAdmin: boolean;
  onDelete: (id: number) => void;
}): ColumnDef<CaseRow>[] => {
  const { isAdmin, onDelete } = opts;

  return [
    { accessorKey: 'caseNumber', header: '案件編號' },
    { accessorKey: 'caseType', header: '案件類型' },
    { accessorKey: 'submitUnit', header: '送件單位' },
    { accessorKey: 'submitterName', header: '送件人姓名' },
    { accessorKey: 'Creator_Name', header: '資料建立者姓名' },
    { accessorKey: 'createdAt', header: '建立時間' },
    {
      id: 'actions',
      header: () => <div className="text-center">操作</div>,
      cell: ({ row }) => {
        const id = Number(row.original.id);
        return (
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href={`/case/${id}`}>查看詳細</Link>
            </Button>
             <Button
                        variant="outline"
                        size="sm"
                        disabled={!isAdmin}
                        onClick={() => {
                        if (!isAdmin) {
                              // 這裡可換成 toast / dialog
                              alert('您沒有編輯權限');
                              return;
                        }
                        router.push(`/case/${id}/edit`);
                        }}
           >
                 編輯
                  </Button>

      {/* 刪除：同理 */}
      <Button
                  variant="destructive"
                  size="sm"
                  disabled={!isAdmin}
                  onClick={() => {
                        if (!isAdmin) {
                              alert('您沒有刪除權限');
                              return;
                        }
                        onDelete(id);
                        }}
             >
                刪除
              </Button>
          </div>
        );
      },
    },
  ];
};
