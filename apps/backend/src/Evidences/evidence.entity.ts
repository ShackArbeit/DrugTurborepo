import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,OneToOne} from 'typeorm';
import { ObjectType,Field,Int } from '@nestjs/graphql';
import {Case} from '../Case/case.entity'


@Entity({name:'evidence'})
@ObjectType()
export class  Evidence{
      // 主鍵
      @Field(()=>Int)
      @PrimaryGeneratedColumn()
      id:number

      @Field(()=>Int)
      @Column({type:"integer",name:"case_id"})
      caseId:number // 外鍵欄位：對應 Case 的 ID

      @Field()
      @Column({type:"text",name:"evidence_number",unique:true})
      evidenceNumber: string;   // 證物編號

      @Field()
      @Column({type:"text",name:"evidence_type"})
      evidenceType: string; // 證物類型

      @Field({nullable:true})
      @Column({type:"text",name:"evidence_branc",nullable:true})
      evidenceBrand?: string;  // 證物廠牌

      @Field({nullable:true})
      @Column({type:"text",name:"evidence_serial_no",nullable:true})
      evidenceSerialNo?: string; // 證物序號 (廠牌序號，可選)

      @Field({nullable:true})
      @Column({type:"text",name:"evidence_original_no",nullable:true})
      evidenceOriginalNo?: string; // 原始標籤編號 (貼紙號，可選)

      @Field({nullable:true})
      @Column({type:"text",name:"photo_front",nullable:true})
      photoFront?: string;  //證物正面照片

      @Field({nullable:true})
      @Column({type:"text",name:"photo_back",nullable:true})
      photoBack?: string; // 證物反面照片   
      

      // 交付人姓名(行政人員)
      @Field({nullable:false})
      @Column({ type: 'text', name: 'delivery_Name', nullable: true })
      deliveryName?: string; 

      // 收件人姓名(鑑識人員)
      @Field({nullable:false})
      @Column({ type: 'text', name: 'receiver_Name', nullable: true })
      receiverName?: string; 

      // 以上是證物從行政人員交付給鑑識人員的部分

      // 以下是證物見識完成後，由行政人員交付給原單位的部分

      @Field({nullable:true})
      @Column({type:"text",name:"photo_front2",nullable:true})
      photoFront2?: string;  //證物正面照片

      @Field({nullable:true})
      @Column({type:"text",name:"photo_back2",nullable:true})
      photoBack2?: string; // 證物反面照片  

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

      // 交付人姓名(行政人員)
      @Field({nullable:false})
      @Column({ type: 'text', name: 'delivery_Name2', nullable: true })
      deliveryName2?: string; 

      // 收件人姓名(原單位人員)
      @Field({nullable:false})
      @Column({ type: 'text', name: 'receiver_Name2', nullable: true })
      receiverName2?: string; 

      @Field()
      @Column({ type: 'text', name: 'created_at' })
      createdAt: string;         // 建立時間



     

      // 關聯欄位：多個證物屬於一個案件
      @Field(() => Case)
      @ManyToOne(() => Case, caseEntity => caseEntity.evidences, { onDelete: 'CASCADE' })
      @JoinColumn({ name: 'case_id' })      // 明確指定外鍵欄位名稱為 case_id
      case: Case;

      // 是否已領回
      @Field()
      @Column({type:'boolean',name:'is_Pickup'})
      is_Pickup:boolean;

     
}