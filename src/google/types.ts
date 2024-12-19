export enum Errors {
  NO_FILE_SELECTED = 'NO_FILE_SELECTED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

export type TokenResponse = google.accounts.oauth2.TokenResponse & {
  expiresAt: number
}
