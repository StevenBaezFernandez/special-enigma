import { User } from '@virteex/domain-identity-domain';
import { UserResponseDto } from '@virteex/domain-identity-contracts';

export class UserMapper {
  static toDto(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.country = user.country;
    dto.timezone = user.timezone;
    dto.phone = user.phone;
    dto.avatarUrl = user.avatarUrl;
    dto.role = user.role;
    dto.isActive = user.isActive;
    dto.status = user.status;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;

    if (user.company) {
      dto.companyName = user.company.name;
      dto.companyId = user.company.id;
    }

    return dto;
  }
}
