import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class InitiateSignupResponse {
  @Field()
  success!: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  challengeId?: string;
}

@ObjectType()
export class VerifySignupResponse {
    @Field()
    success!: boolean;

    @Field({ nullable: true })
    accessToken?: string;
}
