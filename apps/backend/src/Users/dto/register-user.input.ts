import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class RegisterUserInput {
  @Field()
  @IsNotEmpty()
  username: string;

  @Field()
  @MinLength(6)
  password: string

  @Field()
  @IsEmail()
  email: string;
}

@InputType()
export class ForgotPasswordInput {
  @Field()
  @IsNotEmpty()
  username: string;

  @Field()
  @IsEmail()
  email: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsNotEmpty()
  token: string;

  @Field()
  @MinLength(6)
  newPassword:string;
}
