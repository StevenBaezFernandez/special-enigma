import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { AccountType } from '../../../shared/enums/account-type.enum';
import { ICreateAccount } from '../../../core/create-account.interface';

export class CreateAccountDto implements ICreateAccount {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(AccountType)
  type!: AccountType;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
