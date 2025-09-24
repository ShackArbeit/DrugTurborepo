'use client'
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "../ui/button"
import Link from "next/link"

export type EvidenceRow={
      id:number;
      evidenceNumber:string;
      evidenceBrand:string;
      evidenceSerialNo:string; // 證物序號 (廠牌序號，可選)
      evidenceOriginalNo:string; // 原始證物編號
      evidenceType:string;
      receiveTime: string;
      deliveryName:string;
      receiverName: string;
      createdAt: string | Date;
      is_Pickup:boolean;
}

export const EvidenceColumns=(isAdmin:boolean,onDelete:(id:number)=>void):ColumnDef<EvidenceRow>[]=>{
      return [
            //  {accessorKey:'deliveryName', header:'證物交付者'},
            //  {accessorKey:'receiverName', header:'接受證物鑑識人員姓名'},
             {accessorKey:'evidenceNumber', header:'證物編號'},
             {accessorKey:'evidenceType', header:'證物類型'},
             {accessorKey:'evidenceBrand', header:'證物廠牌名稱'},
            //  {accessorKey:'evidenceSerialNo', header:'證物廠牌序號'},
             {accessorKey:'evidenceOriginalNo', header:'原始證物編號'},
              {
                  accessorKey: 'is_Pickup',
                  header: '鑑識後是否已領回',
            
                  cell: ({ row }) => {
            
                  const isPickedUp = row.original.is_Pickup;
                  
            
                  return <span>{isPickedUp ? '已領回' : '尚未領回'}</span>;
             },
            },
             {accessorKey:'createdAt', header:'資料建立時間'},
             {
                  id:'actions',
                  header:()=><div className="text-center">操作</div>,
                  cell:({row})=>{
                        const id=Number(row.original.id)
                        return (
                                <div className="flex gap-2">
                                    <Button asChild variant="secondary" size="sm">
                                          <Link href={`/evidence/${id}`}>查看詳細</Link>
                                    </Button>
                                    <Button  variant="outline" size="sm" disabled={!isAdmin}>
                                          <Link href={`/evidence/${id}/edit`}>編輯</Link>
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => onDelete(id)} disabled={!isAdmin}>
                                          刪除
                                    </Button>
                               </div>
                        )
                  }
             }
      ]
}