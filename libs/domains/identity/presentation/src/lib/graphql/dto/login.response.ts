import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class LoginResponse {
  @Field({ nullable: true })
  accessToken?: string;

  @Field({ nullable: true })
  refreshToken?: string;

  @Field(() => Int, { nullable: true })
  expiresIn?: number;

  @Field({ nullable: true })
  mfaRequired?: boolean;

  @Field({ nullable: true })
  tempToken?: string;
}
