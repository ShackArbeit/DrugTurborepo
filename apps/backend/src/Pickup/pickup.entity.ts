import { Entity,PrimaryGeneratedColumn,Column,ManyToOne,JoinColumn,OneToOne} from "typeorm";
import { ObjectType,Field,Int } from "@nestjs/graphql";
import { Case } from "src/Case/case.entity";
import { Evidence } from "src/Evidences/evidence.entity";

@Entity({name:'pickup'})
@ObjectType()
export class PickUp{
      // 主鍵
      @Field(()=>Int)
      @PrimaryGeneratedColumn()
      id:number

      // 因為要知道領回的證物是哪一個證物，所以要加上證物編號的外鍵
      @OneToOne(() => Evidence, evidence => evidence.pickup, {onDelete: 'CASCADE',})
      @JoinColumn({ name: 'evidence_id' })
      evidence: Evidence;

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
      receiver_name?: string;

      // 交付者簽章
      @Field({ nullable: false })
      @Column()
      delivery_signature?: string;

      // 領回者簽章
      @Field({ nullable: false })
      @Column()
      receiver_signature:string

      // 備註欄
      @Field({ nullable: true })
      @Column()
      remarks?: string;

      // 建立時間
      @Field()
      @Column({ type: 'text', name: 'create_at' })
      created_at: string;



}