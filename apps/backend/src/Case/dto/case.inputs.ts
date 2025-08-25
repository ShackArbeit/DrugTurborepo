import { InputType,PartialType,Field,Int } from "@nestjs/graphql";

// 第一部分是讓使用者輸入並變成 GraphQL API 的項目
@InputType()
export class CreateCaseInput{

      // 案件編號
      @Field(()=>String,{description:'案件編號',nullable:true})
      caseNumber:string

      // 股別
      @Field(()=>String,{description:'股別',nullable:true})
      section:string

      // 年度
      @Field(()=>Int,{description:'年度',nullable:true})
      year:number

      // 冠字
      @Field(()=>String,{description:'冠字',nullable:true})
      prefixLetter:string

      // 案件類型
      @Field(()=>String,{description:'案件類型',nullable:false})
      caseType:string

      // 案件摘要/說明
      @Field(()=>String,{description:'案件摘要',nullable:false})
      caseName:string

      // 送件單位
      @Field(()=>String,{description:'送件單位',nullable:false})
      submitUnit:string

      // 建立案件人姓名
      @Field(()=>String,{description:'建立案件人姓名',nullable:false})
      Creator_Name:string

      // 送件人姓名
      @Field(()=>String,{description:'送件人姓名',nullable:false})
      submitterName:string

      // 送件人手機
      @Field(()=>String,{description:'送件人手機',nullable:false})
      submitterPhone:string

      // 送件人電話
      @Field(()=>String,{description:'送件人電話',nullable:false})
      submitterTel:string

     // 滿意度一
     @Field(()=>String,{description:'滿意度一',nullable:true})
     satisfaction_levelOne:string

     // 滿意度二
     @Field(()=>String,{description:'滿意度二',nullable:true})
     satisfaction_levelTwo:string

     // 滿意度三
     @Field(()=>String,{description:'滿意度三',nullable:true})
     satisfaction_levelThree:string

     // 滿意度四
     @Field(()=>String,{description:'滿意度四',nullable:true})
     satisfaction_levelFour:string

      // 建立時間
      @Field(()=>String,{description:'建立時間',nullable: true, defaultValue: null})
      createdAt:string
}


// 第二部分是讓輸入後的欄位可以更新的部分
@InputType()
export class UpdateCaseInput extends PartialType(
      CreateCaseInput
){}