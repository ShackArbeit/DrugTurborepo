import { InputType,PartialType,Field} from "@nestjs/graphql";

// 第一部分是讓使用者輸入並變成 GraphQL API 的項目
@InputType()
export class CreateEvidenceInput{
      //  這是為了配合前端邏輯而更改的，因為一個案件可以有多的證物，所以建立證物資料時
      // 要先在前端輸入相對應的"案件編號"(caseNumber) 以利之後資料庫內的查找關係
      // 對應的案件編號
      @Field(()=>String,{description:'對應案件的 caseNumber',nullable:false})
      caseNumber:string

      // 證物編號 
      @Field(()=>String,{description:'證物編號',nullable:false})
      evidenceNumber:string

      // 證物類型
      @Field(()=>String,{description:'證物類型',nullable:false})
      evidenceType:string

      // 證物廠牌
     @Field(()=>String,{description:'證物廠牌',nullable:false})
     evidenceBrand:string

     // 證物序號 (廠牌序號，可選)
     @Field(()=>String,{description:'廠牌序號',nullable:true})
     evidenceSerialNo:string

     // 原始標籤編號
     @Field(()=>String,{description:'原始標籤編號',nullable:true})
     evidenceOriginalNo:string

     //證物正面照片
     @Field(()=>String,{description:'正面照片',nullable:false})
     photoFront:string

     //證物反面照片
     @Field(()=>String,{description:'反面照片',nullable:false})
     photoBack:string

     // 收件時間
     @Field(()=>String,{description:'收件時間',nullable:false})
     receiveTime:string


     // 建立時間
     @Field(()=>String,{description:'建立時間',nullable:false})
     createdAt:string

    // 交付人簽章 (圖檔/base64)
    @Field(()=>String,{description:'交付人簽章',nullable:false})
    deliverySignature:string

    // 收件人簽章(圖檔/base64)
    @Field(()=>String,{description:'收件人簽章',nullable:false})
    receiverSignature:string
}

// 第二部分是讓輸入後的欄位可以更新的部分
@InputType()
export class UpdateEvidenceInput extends PartialType(CreateEvidenceInput)
{}
