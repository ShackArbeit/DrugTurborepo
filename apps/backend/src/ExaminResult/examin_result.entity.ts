import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Evidence } from "src/Evidences/evidence.entity";

@Entity({name:'testResult'})
@ObjectType()
export class ExaminResult{
     // 主鍵
     @Field(()=>Int)
     @PrimaryGeneratedColumn()
     id:number

     // 所對應的證物的 ID
     @Field(()=>Int)
     @Column({type:'integer',name:'evidence_id'})
     evidence_id:number

     // 是否應退件
     @Field()
     @Column({type:'boolean',name:'is_rejected'})
     is_rejected:boolean

     // 是否超出鑑識能力範圍
     @Field()
     @Column({type:'boolean',name:'is_beyond_scope'})
     is_beyond_scope:boolean

     // 是否屬於實驗室鑑識項目
     @Field()
     @Column({type:'boolean',name:'is_lab_related'})
     is_lab_related:boolean

     // 案件資訊是否完整（可評估是否補件）
     @Field()
     @Column({type:'boolean',name:'is_info_complete'})
     is_info_complete:boolean

     // 鑑識人員姓名
     @Field({nullable:false})
     @Column({type:'text',name:'examiner_name',nullable:true})
     examiner_name:string

     // 備註欄
     @Field({nullable:true})
     @Column({type:'text',name:'remarks',nullable:true})
     remarks:string

     // 建立時間 (ISO 格式字串)
     @Field()
     @Column({type:'text',name:'created_at'})
     created_at:string

     // 最後更新時間
     @Field()
     @Column({type:'text',name:'updated_at'})
     updated_at:string

     // 關聯欄位：一個證物對應一個檢測結果
     @Field(()=>Evidence,{nullable:false})
     @OneToOne(() => Evidence,EvidenceEntity=>EvidenceEntity.examinResult,{onDelete:'NO ACTION'})
     @JoinColumn({ name: 'evidence_id' })
     evidences?:Evidence
}