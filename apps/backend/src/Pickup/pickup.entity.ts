import { Entity,PrimaryGeneratedColumn,Column,ManyToOne,JoinColumn,OneToOne} from "typeorm";
import { ObjectType,Field,Int } from "@nestjs/graphql";
import { Evidence } from "../Evidences/evidence.entity";

@Entity({name:'pickup'})
@ObjectType()
export class PickUp{
      // 主鍵
      @Field(()=>Int)
      @PrimaryGeneratedColumn()
      id:number

     // 所對應的證物的 ID
     @Field(()=>Int)
     @Column({type:'integer',name:'evidence_id'})
     evidence_id:number

      // 因為要知道領回的證物是哪一個證物，所以要加上證物編號的外鍵
      @Field(()=>Evidence,{nullable:false})
      @OneToOne(() => Evidence, evidence => evidence.pickup, {onDelete: 'CASCADE',})
      @JoinColumn({ name: 'evidence_id' })
      evidences?: Evidence;

      // 領回時間
      @Field()
      @Column({ type: 'text', name: 'pick_at' })
      pickup_time: string;

      // 領回時拍照上傳的圖片路徑或 base64 編碼
      @Field({nullable:false})
      @Column({ type: 'text', name: 'photo_path' })
      photo_path?: string;

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

      // 領回者姓名
      @Field({ nullable: false })
      @Column()
      receiver_Name?: string;

      // 交付人姓名
      @Field({ nullable: false })
      @Column()
      delivery_Name?: string;

      // 備註欄
      @Field({ nullable: true })
      @Column()
      remarks?: string;

      // 建立時間
      @Field()
      @Column({ type: 'text', name: 'create_at' })
      created_at: string;

}