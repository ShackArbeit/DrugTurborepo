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

      @Field()
      @Column()
      password: string;

      @Field()
      @Column({ unique: true })
      email: string ;

      @Field(()=>String)
      @Column({ type: 'text', default: Role.User })
      role:Role
}