export class LoginResponseDto {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;

  // MFA Fields
  mfaRequired?: boolean;
  tempToken?: string; // Token to exchange for full access after MFA
}
