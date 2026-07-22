export const ERROR_I18N_MAP: Record<string, string> = {
  'APPLICATION_AUTH_NOT_FOUND_ERROR': 'errors.auth.notFound',
  'APPLICATION_AUTH_INVALID_CREDENTIALS': 'errors.auth.invalidCredentials',
};

export const ERROR_FALLBACK_KEYS = {
  network: 'errors.network',
  server: 'errors.server',
  unexpected: 'errors.unexpected',
} as const;
