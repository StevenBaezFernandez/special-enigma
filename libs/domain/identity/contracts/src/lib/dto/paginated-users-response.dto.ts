import { UserResponseDto } from './user-response.dto';

export class PaginatedUsersResponse {
  data!: UserResponseDto[];
  total!: number;
}
