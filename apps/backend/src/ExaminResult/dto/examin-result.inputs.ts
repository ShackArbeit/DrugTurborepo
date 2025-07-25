import { InputType,PartialType,Field,Int } from "@nestjs/graphql";

// 第一部分是讓使用者輸入並變成 GraphQL API 的項目
@InputType()
export class CreateExaminResultsInput{

      //  這是為了配合前端邏輯而更改的，因為一個鑑識結果對應一個證物，所以建立鑑識結果時
      // 要先在前端輸入相對應的"證物編號"(evidenceNumber 以利之後資料庫內的查找關係
      // 對應的案件編號
      @Field(()=>String,{description:'對應證物的 evidenceNumber',nullable:false})
      evidenceNumber:string
      
      // 是否應退件
      @Field(()=>Boolean,{description:'是否應退件',nullable:false})
      is_rejected:boolean

      // 是否超出鑑識能力範圍
      @Field(()=>Boolean,{description:'是否超出鑑識能力範圍',nullable:false})
      is_beyond_scope:boolean

      // 是否屬於實驗室鑑識項目
      @Field(()=>Boolean,{description:'是否屬於實驗室鑑識項目',nullable:false})
      is_lab_related:boolean

      // 案件資訊是否完整（可評估是否補件）
      @Field(()=>Boolean,{description:'案件資訊是否完整',nullable:false})
      is_info_complete:boolean

      // 鑑識人員姓名
      @Field(()=>String,{description:'鑑識人員姓名',nullable:false})
      examiner_name:string

      // 備註欄
      @Field(()=>String,{description:'備註欄',nullable:true})
      remarks:string

      // 建立時間 (ISO 格式字串)
      @Field(()=>String,{description:'建立時間',nullable:false})
      created_at:string

      // 最後更新時間
      @Field(()=>String,{description:'最後更新時間',nullable:false})
      updated_at:string
}

// 第二部分是讓輸入後的欄位可以更新的部分
@InputType()
export class UpdateExaminResultsInput extends PartialType(CreateExaminResultsInput)
{}

