export interface CookiePolicyContext {
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  domain?: string;
}

export function buildAccessCookieOptions(context: CookiePolicyContext) {
  return {
    httpOnly: true,
    secure: context.secure,
    sameSite: context.sameSite,
    path: '/',
    domain: context.domain,
    maxAge: 15 * 60 * 1000,
  } as const;
}

export function buildRefreshCookieOptions(context: CookiePolicyContext, rememberMe: boolean) {
  return {
    httpOnly: true,
    secure: context.secure,
    sameSite: context.sameSite,
    path: '/auth/refresh',
    domain: context.domain,
    maxAge: rememberMe ? 7 * 24 * 3600 * 1000 : 24 * 3600 * 1000,
  } as const;
}

export function buildCsrfCookieOptions(context: CookiePolicyContext) {
  return {
    httpOnly: false,
    secure: context.secure,
    sameSite: context.sameSite,
    path: '/',
    domain: context.domain,
    maxAge: 2 * 60 * 60 * 1000,
  } as const;
}
