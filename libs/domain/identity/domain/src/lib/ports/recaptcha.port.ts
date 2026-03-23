export abstract class RecaptchaPort {
  abstract verify(token: string, action?: string): Promise<boolean>;
}
