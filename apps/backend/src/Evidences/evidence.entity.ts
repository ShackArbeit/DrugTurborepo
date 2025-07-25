import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,OneToOne} from 'typeorm';
import { ObjectType,Field,Int } from '@nestjs/graphql';
import {Case} from '../Case/case.entity'
import { ExaminResult } from '../ExaminResult/examin_result.entity'
import {PickUp} from '../Pickup/pickup.entity'

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
      

      @Field({nullable:false})
      @Column({ type: 'text', name: 'receive_time', nullable: true })
      receiveTime?: string;      // 收件時間

      @Field({nullable:false})
      @Column({ type: 'text', name: 'delivery_signature', nullable: true })
      deliverySignature?: string; // 交付人簽章 (圖檔/base64)

      
      @Field({nullable:false})
      @Column({ type: 'text', name: 'receiver_signature', nullable: true })
      receiverSignature?: string; // 收件人簽章

      @Field()
      @Column({ type: 'text', name: 'created_at' })
      createdAt: string;         // 建立時間

      // 關聯欄位：多個證物屬於一個案件
      @Field(() => Case)
      @ManyToOne(() => Case, caseEntity => caseEntity.evidences, { onDelete: 'CASCADE' })
      @JoinColumn({ name: 'case_id' })      // 明確指定外鍵欄位名稱為 case_id
      case: Case;

      // 關聯欄位:一個證物對應一個證物檢測結果
      @Field(()=>ExaminResult)
      @OneToOne(()=>ExaminResult,examinResult=>examinResult.evidences,{
              cascade:true,
              eager:false
      })
      examinResult?:ExaminResult


       // 關聯欄位:一個證物對應一個證物領回紀錄
      @Field(()=>PickUp)
      @OneToOne(() => PickUp, pickup => pickup.evidences, {cascade: true,onDelete: 'CASCADE',})
      pickup: PickUp;
}