declare module 'passport-openidconnect' {
  import { Profile, Strategy as PassportStrategy } from 'passport';

  export interface OpenIDConnectStrategyOptions {
    issuer?: string;
    authorizationURL: string;
    tokenURL: string;
    userInfoURL: string;
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    passReqToCallback?: boolean;
  }

  export type VerifyCallback = (err: Error | null, user?: unknown, info?: unknown) => void;

  export type VerifyFunction = (
    issuer: string,
    profile: Profile,
    done: VerifyCallback
  ) => void | Promise<void>;

  export class Strategy extends PassportStrategy {
    constructor(options: OpenIDConnectStrategyOptions, verify?: VerifyFunction);
  }
}
