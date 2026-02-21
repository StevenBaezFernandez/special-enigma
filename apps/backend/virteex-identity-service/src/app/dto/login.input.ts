import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsNotEmpty()
  password!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
