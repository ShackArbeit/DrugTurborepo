'use client';

import {ColumnDef} from '@tanstack/react-table';
import {Button} from '../ui/button';
import Link from 'next/link';
import {useTranslations} from 'next-intl';

export type EvidenceRow = {
  id: number;
  evidenceNumber: string;
  evidenceBrand: string;
  evidenceSerialNo: string;
  evidenceOriginalNo: string;
  evidenceType: string;
  receiveTime: string;
  deliveryName: string;
  receiverName: string;
  createdAt: string | Date;
  is_Pickup: boolean;
};

export const EvidenceColumns = (
  isAdmin: boolean,
  onDelete: (id: number) => void
): ColumnDef<EvidenceRow>[] => {
  const t = useTranslations('Evidences');

  return [
    // {accessorKey: 'deliveryName', header: t('columns.deliveryName')},
    // {accessorKey: 'receiverName', header: t('columns.receiverName')},
    {accessorKey: 'evidenceNumber', header: t('columns.evidenceNumber')},
    {accessorKey: 'evidenceType', header: t('columns.evidenceType')},
    {accessorKey: 'evidenceBrand', header: t('columns.evidenceBrand')},
    // {accessorKey: 'evidenceSerialNo', header: t('columns.evidenceSerialNo')},
    {accessorKey: 'evidenceOriginalNo', header: t('columns.evidenceOriginalNo')},
    {
      accessorKey: 'is_Pickup',
      header: t('columns.isPickedUp'),
      cell: ({row}) => {
        const isPickedUp = row.original.is_Pickup;
        return <span>{isPickedUp ? t('cells.picked') : t('cells.unpicked')}</span>;
      }
    },
    {accessorKey: 'createdAt', header: t('columns.createdAt')},
    {
      id: 'actions',
      header: () => <div className="text-center">{t('columns.actions')}</div>,
      cell: ({row}) => {
        const id = Number(row.original.id);
        return (
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href={`/evidence/${id}`}>{t('actions.view')}</Link>
            </Button>
            <Button variant="outline" size="sm" disabled={!isAdmin}>
              <Link href={`/evidence/${id}/edit`}>{t('actions.edit')}</Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(id)}
              disabled={!isAdmin}
            >
              {t('actions.delete')}
            </Button>
          </div>
        );
      }
    }
  ];
};
