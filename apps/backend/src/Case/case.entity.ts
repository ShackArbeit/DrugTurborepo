import { Entity,PrimaryGeneratedColumn,Column,OneToMany } from "typeorm";
import { ObjectType,Field,Int} from "@nestjs/graphql";
import { Evidence } from "src/Evidences/evidence.entity";

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

      // 送件人手機
      @Field()
      @Column({type:"text",name:"submitter_phone"})
      submitterPhone: string;

      // 送件人市話 
      @Field({nullable:false})
      @Column({type:"text",name:"submitter_tel",nullable:true})
      submitterTel?:string
  
      // 送件人簽章 (圖檔路徑或 base64)
      @Field({nullable:false})
      @Column({ type: 'text', name: 'submitter_signature', nullable: true })
      submitterSignature?: string; 

      // 建立時間 (ISO 格式字串)
      @Field()
      @Column({ type: 'text', name: 'created_at' })
      createdAt: string;

      // 關聯欄位：一個案件有多個證物
      @Field(()=>[Evidence],{nullable:"items"})
      @OneToMany(()=>Evidence,EvidenceEntity=>EvidenceEntity.case,{cascade:true})
      evidences?:Evidence[]
}