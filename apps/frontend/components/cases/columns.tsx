'use client';
import {ColumnDef} from '@tanstack/react-table';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {useTranslations} from 'next-intl';

export type EvidenceLite = { id: number; evidenceNumber?: string | null; evidenceType?: string | null; };
export type CaseRow = {
  id: number; caseName: string; caseNumber: string; caseType: string; createdAt: string;
  evidences: EvidenceLite[]; prefixLetter: string; section: string; submitUnit: string;
  submitterName: string; submitterPhone: string; submitterSignature: string; submitterTel: string; year: number;
};

export const columns = (opts: {isAdmin: boolean; onDelete: (id: number) => void;}): ColumnDef<CaseRow>[] => {
  const {isAdmin, onDelete} = opts;
  const t = useTranslations('Cases');

  return [
    {accessorKey: 'caseNumber', header: t('columns.caseNumber')},
    {accessorKey: 'caseType', header: t('columns.caseType')},
    {accessorKey: 'submitUnit', header: t('columns.submitUnit')},
    {accessorKey: 'submitterName', header: t('columns.submitterName')},
    {accessorKey: 'Creator_Name', header: t('columns.creator')},
    {accessorKey: 'createdAt', header: t('columns.createdAt')},
    {
      id: 'actions',
      header: () => <div className="text-center" />,
      cell: ({row}) => {
        const id = Number(row.original.id);
        return (
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href={`/case/${id}`}>{t('view')}</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!isAdmin}
              onClick={() => {
                if (!isAdmin) return alert(t('noPermissionEdit'));
                location.assign(`/case/${id}/edit`);
              }}
            >
              {t('edit')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!isAdmin}
              onClick={() => {
                if (!isAdmin) return alert(t('noPermissionDelete'));
                if (confirm(t('confirmDelete'))) onDelete(id);
              }}
            >
              {t('delete')}
            </Button>
          </div>
        );
      }
    }
  ];
};
