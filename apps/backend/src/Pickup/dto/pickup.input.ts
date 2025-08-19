import { InputType, Field,PartialType } from '@nestjs/graphql';

// 第一部分是讓使用者輸入並變成 GraphQL API 的項目
@InputType()
export class CreatePickupInput{
      @Field()
      pickup_time: string;

      @Field({ nullable: false })
      photo_path?: string;

      @Field({ nullable: false })
      satisfaction_levelOne?: string;

      @Field({ nullable: false })
      satisfaction_levelTwo?: string;

      @Field({ nullable: false })
      satisfaction_levelThree?: string;

      @Field({ nullable: false })
      satisfaction_levelFour?: string;

      @Field({ nullable: false })
      receiver_name?: string;

      @Field({ nullable: false})
      delivery_Name?: string;

      @Field({ nullable: false})
      receiver_Name?: string;


      @Field({ nullable: false })
      remarks?: string;

      @Field()
      evidence_number:string

      @Field()
      created_at: string
}

// 第二部分是讓輸入後的欄位可以更新的部分
@InputType()
export class UpdatePickupInput extends PartialType(CreatePickupInput){}