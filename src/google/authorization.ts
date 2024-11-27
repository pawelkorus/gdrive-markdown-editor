import { authenticateUser } from './authentication'
import { CLIENT_ID, SCOPE_DRIVE_APPDATA, SCOPE_FILE_ACCESS, SCOPE_INSTALL } from './const'
import { ensureGISLibraryLoaded } from './load'

type RequestTokenSuccess = (tokenReponse: google.accounts.oauth2.TokenResponse) => void
type RequestTokenReject = (error: unknown) => void

class TokenCallbackResult {
  private r: RequestTokenSuccess
  private e: RequestTokenReject

  constructor(r: RequestTokenSuccess, e: RequestTokenReject) {
    this.r = r
    this.e = e
  }

  public resolve(tokenReponse: google.accounts.oauth2.TokenResponse) {
    this.r(tokenReponse)
  }

  public reject(error: unknown) {
    this.e(error)
  }
}

type TokenResponse = google.accounts.oauth2.TokenResponse & {
  expiresAt: number
}

let waitForTokenResult: TokenCallbackResult
let latestTokenResponse: TokenResponse | undefined = undefined
let tokenClient: google.accounts.oauth2.TokenClient | undefined = undefined

async function ensureTokenClient() {
  await ensureGISLibraryLoaded
  if (!tokenClient) {
    const user = await authenticateUser

    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE_INSTALL,
      prompt: '',
      callback: async (tokenResponse: google.accounts.oauth2.TokenResponse) => {
        const expiresAt = Date.now() + Number(tokenResponse.expires_in) * 1000

        latestTokenResponse = {
          ...tokenResponse,
          expiresAt: expiresAt - 30000, // 30 seconds before expiration
        }

        if (!waitForTokenResult) return

        if (tokenResponse.error !== undefined) {
          waitForTokenResult.reject(tokenResponse.error)
        }

        waitForTokenResult.resolve(tokenResponse)
      },
      login_hint: user.id,
    })
  }

  return tokenClient
}

export function authorizeInstall(): Promise<unknown> {
  return requestAccess(Permissions.INSTALL)
}

export enum Permissions {
  INSTALL = 'INSTALL',
  SAVE_SELECTED_FILE = 'SAVE_FILE',
  READ_SELECTED_FILE = 'READ_SELECTED_FILE',
  BROWSE_FILES = 'BROWSE_FILES',
  READ_FILE = 'READ_FILE',
  MAINTAIN_APP_DATA = 'MAINTAIN_APP_DATA',
}

export function currentToken(): google.accounts.oauth2.TokenResponse {
  return latestTokenResponse!
}

export async function requestAccess(requiredPesmission: Permissions): Promise<unknown> {
  const tokenClient = await ensureTokenClient()

  function toScope(permission: Permissions): string {
    switch (permission) {
      case Permissions.INSTALL:
        return SCOPE_INSTALL
      case Permissions.SAVE_SELECTED_FILE:
      case Permissions.READ_SELECTED_FILE:
      case Permissions.BROWSE_FILES:
      case Permissions.READ_FILE:
        return SCOPE_FILE_ACCESS
      case Permissions.MAINTAIN_APP_DATA:
        return SCOPE_DRIVE_APPDATA
    }
  }

  const user = await authenticateUser

  return new Promise((resolve, reject) => {
    waitForTokenResult = new TokenCallbackResult(resolve, reject)

    tokenClient.requestAccessToken({
      scope: toScope(requiredPesmission),
      hint: user.id,
    })
  })
}

export function hasPermission(permission: Permissions): boolean {
  if (!latestTokenResponse) return false
  if (latestTokenResponse.expiresAt < Date.now()) return false

  return hasGrantedPermission(latestTokenResponse, permission)
}

function hasGrantedPermission(token: TokenResponse, permission: Permissions): boolean {
  switch (permission) {
    case Permissions.SAVE_SELECTED_FILE:
      return google.accounts.oauth2.hasGrantedAnyScope(token, SCOPE_FILE_ACCESS)
    case Permissions.READ_SELECTED_FILE:
      return google.accounts.oauth2.hasGrantedAnyScope(token, SCOPE_FILE_ACCESS)
    case Permissions.BROWSE_FILES:
      return google.accounts.oauth2.hasGrantedAnyScope(token, SCOPE_FILE_ACCESS)
    case Permissions.READ_FILE:
      return google.accounts.oauth2.hasGrantedAnyScope(token, SCOPE_FILE_ACCESS)
    case Permissions.INSTALL:
      return google.accounts.oauth2.hasGrantedAnyScope(token, SCOPE_INSTALL)
    case Permissions.MAINTAIN_APP_DATA:
      return google.accounts.oauth2.hasGrantedAnyScope(token, SCOPE_DRIVE_APPDATA)
    default:
      return false
  }
}
