import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Role } from '../Auth/role/role.enum';

@ObjectType()
@Entity()
export class User{
      @Field(() => ID)
      @PrimaryGeneratedColumn()
      id:number

      @Field()
      @Column({ unique: true })
      username: string;

      
      @Column()
      password: string;

      @Field()
      @Column({ unique: true })
      email: string ;

      @Field(()=>String)
      @Column({ type: 'text', default: Role.User })
      role:Role

      //  以下是忘記密碼時的設定
      @Column({ type: 'varchar', length: 128, nullable: true })
      resetPasswordToken: string | null;

      @Column({ type: 'timestamp', nullable: true })
      resetPasswordExpires: Date | null;
}