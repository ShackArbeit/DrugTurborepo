// src/Users/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, ID, HideField, registerEnumType } from '@nestjs/graphql';
import { Role } from '../Auth/role/role.enum';

registerEnumType(Role, { name: 'Role' });

@ObjectType()      
@Entity()
export class User {
  @Field(() => ID)       
  @PrimaryGeneratedColumn()
  id: number;

  @Field()               
  @Column({ unique: true })
  username: string;

  @HideField()           
  @Column()
  password: string;

  @Field()               
  @Column({ unique: true })
  email: string;

  @Field(() => Role)     
  @Column({ type: 'text', default: Role.User })
  role: Role;

  @Column({ type: 'text', nullable: true })
  resetPasswordToken: string | null;


  @Column({ type: 'integer', nullable: true })
  resetPasswordExpires: number | null;
}
