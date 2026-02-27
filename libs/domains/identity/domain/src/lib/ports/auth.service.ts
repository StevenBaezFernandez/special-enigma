export abstract class AuthService {
  abstract hashPassword(password: string): Promise<string>;
  abstract verifyPassword(password: string, hash: string): Promise<boolean>;
  abstract generateToken(payload: any, options?: { tokenType?: 'access' | 'refresh' | 'service' | 'plugin' | 'stepup'; expiresIn?: string | number; audience?: string; issuer?: string; subject?: string }): Promise<string>;
  abstract verifyToken(token: string): Promise<any>; // Returns payload or throws
  abstract generateMfaSecret(): string;
  abstract verifyMfaToken(token: string, secret: string): boolean;
  abstract encrypt(text: string): Promise<string>;
  abstract decrypt(text: string): Promise<string>;
}
