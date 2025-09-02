import { Entity,PrimaryGeneratedColumn,Column,OneToMany } from "typeorm";
import { ObjectType,Field,Int} from "@nestjs/graphql";
import {Evidence} from '../Evidences/evidence.entity'


@Entity({name:'case'})
@ObjectType()
export class Case{
      // 主鍵
      @Field(()=>Int)
      @PrimaryGeneratedColumn()
      id:number

      // 案件編號 
      @Field()
      @Column({type:'text',unique:true,name:'case_number'})
      caseNumber:string

      // 股別
      @Field()
      @Column({type:'text'})
      section:string

      // 年度
      @Field(()=>Int)
      @Column({type:'integer'})
      year:number

      // 冠字
      @Field()
      @Column({type:"text",name:'prefix_letter'})
      prefixLetter:string
      
      // 案件類型
      @Field()
      @Column({type:"text",name:'case_type'})
      caseType:string

      // 案件摘要/說明
      @Field()
      @Column({type:"text",name:"case_name"})
      caseName:string

      // 送件單位
      @Field()
      @Column({type:"text",name:"submit_unit"})
      submitUnit:string

      // 送件人姓名
      @Field()
      @Column({type:"text",name:"submitter_name"})
      submitterName: string;  

      // 建立案件紀錄人姓名
      @Field({nullable:false})
      @Column({ type: 'text', name: 'Creator_Name', nullable: true })
      Creator_Name?:string

      // 送件人手機
      @Field()
      @Column({type:"text",name:"submitter_phone"})
      submitterPhone: string;

      // 送件人市話 
      @Field({nullable:false})
      @Column({type:"text",name:"submitter_tel",nullable:true})
      submitterTel?:string


      // 以下為滿意度部分，將原本在 PickUp 的滿意度是針對證物，現在讓所有的滿意度只針對案件
      // 滿意度一
      @Field({ nullable: false })
      @Column()
      satisfaction_levelOne: string;

      // 滿意度二
      @Field({ nullable: false })
      @Column()
      satisfaction_levelTwo: string;

      // 滿意度三
      @Field({ nullable: false })
      @Column()
      satisfaction_levelThree: string;

      // 滿意度四
      @Field({ nullable: false })
      @Column()
      satisfaction_levelFour: string;


      // 建立時間 (ISO 格式字串)
      @Field()
      @Column({ type: 'text', name: 'created_at' })
      createdAt: string;

      // 關聯欄位：一個案件有多個證物
      @Field(()=>[Evidence],{nullable:"items"})
      @OneToMany(()=>Evidence,EvidenceEntity=>EvidenceEntity.case,{cascade:true})
      evidences?:Evidence[]

      // ✅ 動態欄位：不入庫，由 Resolver 計算
      @Field(() => Int, { description: '此案件目前的證物數量（動態欄位'})
      evidenceCount?:number
}