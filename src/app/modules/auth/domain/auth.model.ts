export type AuthRole = 'Admin' | 'Regular';

export type AppContext = 'admin' | 'tenant' | 'unknown';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JwtSession {
  token: string;
  role: AuthRole;
  expiresAt: Date;
  hostname: string;
}
