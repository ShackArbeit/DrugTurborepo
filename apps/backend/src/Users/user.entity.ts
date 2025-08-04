import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Role } from './role.enum';

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

      @Field(()=>String)
      @Column({ type: 'text', default: Role.User })
      role:Role
}