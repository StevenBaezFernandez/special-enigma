import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateWarehouseInput {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    location?: string;
}
