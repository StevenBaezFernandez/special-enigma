export class UserResponseDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  country!: string;
  timezone!: string;
  phone?: string;
  avatarUrl?: string;
  role!: string;
  companyName?: string;
  companyId?: string;
  isActive!: boolean;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
