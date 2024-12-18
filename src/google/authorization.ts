import { Errors } from './types'
import { authenticateUser } from './authentication'
import { CLIENT_ID, SCOPE_DRIVE_APPDATA, SCOPE_DRIVE_READONLY, SCOPE_DRIVE_FILE, SCOPE_INSTALL, SCOPE_DRIVE, SCOPE_DRIVE_METADATA, SCOPE_DRIVE_PHOTOS_READONLY, SCOPE_DRIVE_METADATA_READONLY } from './const'
import { ensureGISLibraryLoaded } from './load'

type RequestTokenSuccess = (tokenReponse: TokenResponse) => void
type RequestTokenReject = (error: unknown) => void

class TokenCallbackResult {
  private r: RequestTokenSuccess
  private e: RequestTokenReject

  constructor(r: RequestTokenSuccess, e: RequestTokenReject) {
    this.r = r
    this.e = e
  }

  public resolve(tokenReponse: TokenResponse) {
    this.r(tokenReponse)
  }

  public reject(error: unknown) {
    this.e(error)
  }
}

type TokenResponse = google.accounts.oauth2.TokenResponse & {
  expiresAt: number
}

const waitForTokenResult: TokenCallbackResult[] = []
let currentPermissionRequest: Promise<void> = Promise.resolve()
let latestTokenResponse: TokenResponse | null = null
let tokenClient: google.accounts.oauth2.TokenClient | null = null

async function ensureTokenClient() {
  await ensureGISLibraryLoaded
  if (!tokenClient) {
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
          waitForTokenResult.shift().reject(tokenResponse.error)
        }

        waitForTokenResult.shift().resolve(latestTokenResponse)
      },
    })
  }

  return tokenClient
}

export async function ensurePermissionGranted(permission: Permissions) {
  function prepareRequestAccess(permission: Permissions) {
    return requestAccess(permission)
      .then(() => {
        if (hasPermission(permission) != PermissionCheckResult.GRANTED) {
          throw new Error(Errors.PERMISSION_DENIED)
        }
      })
  }

  currentPermissionRequest = currentPermissionRequest
    .then(() => {
      if (hasPermission(permission) == PermissionCheckResult.GRANTED) return
      return prepareRequestAccess(permission)
    }, () => {
      return prepareRequestAccess(permission)
    })

  return currentPermissionRequest
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
  READ_FILE_METADATA = 'READ_FILE_METADATA',
  MAINTAIN_APP_DATA = 'MAINTAIN_APP_DATA',
  READ_ABOUT = 'READ_ABOUT',
}

export enum PermissionCheckResult {
  GRANTED = 'GRANTED',
  NOT_GRANTED = 'NOT_GRANTED',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
}

export function currentToken(): google.accounts.oauth2.TokenResponse {
  return latestTokenResponse!
}

export async function requestAccess(requiredPesmission: Permissions): Promise<void> {
  const tokenClient = await ensureTokenClient()

  const user = await authenticateUser

  return new Promise<void>((resolve, reject) => {
    waitForTokenResult.push(new TokenCallbackResult(() => {
      resolve()
    }, reject))

    tokenClient.requestAccessToken({
      scope: toScope(requiredPesmission),
      hint: user.id,
    })
  })
}

export function hasPermission(permission: Permissions): PermissionCheckResult {
  if (!latestTokenResponse) return PermissionCheckResult.PENDING
  if (latestTokenResponse.expiresAt < Date.now()) return PermissionCheckResult.EXPIRED

  return hasGrantedPermission(latestTokenResponse, permission) ? PermissionCheckResult.GRANTED : PermissionCheckResult.NOT_GRANTED
}

function hasGrantedPermission(token: TokenResponse, permission: Permissions): boolean {
  switch (permission) {
    case Permissions.SAVE_SELECTED_FILE:
      return google.accounts.oauth2.hasGrantedAnyScope(token,
        SCOPE_DRIVE,
        SCOPE_DRIVE_FILE,
      )
    case Permissions.READ_SELECTED_FILE:
      return google.accounts.oauth2.hasGrantedAnyScope(token,
        SCOPE_DRIVE,
        SCOPE_DRIVE_READONLY,
        SCOPE_DRIVE_FILE,
      )
    case Permissions.BROWSE_FILES:
      return google.accounts.oauth2.hasGrantedAnyScope(token,
        SCOPE_DRIVE,
        SCOPE_DRIVE_READONLY,
      )
    case Permissions.READ_FILE:
      return google.accounts.oauth2.hasGrantedAnyScope(token,
        SCOPE_DRIVE,
        SCOPE_DRIVE_READONLY,
      )
    case Permissions.INSTALL:
      return google.accounts.oauth2.hasGrantedAnyScope(token,
        SCOPE_INSTALL,
      )
    case Permissions.MAINTAIN_APP_DATA:
      return google.accounts.oauth2.hasGrantedAnyScope(token,
        SCOPE_DRIVE_APPDATA,
      )
    case Permissions.READ_ABOUT:
      return google.accounts.oauth2.hasGrantedAnyScope(token,
        SCOPE_DRIVE,
        SCOPE_DRIVE_APPDATA,
        SCOPE_DRIVE_FILE,
        SCOPE_DRIVE_METADATA,
        SCOPE_DRIVE_METADATA_READONLY,
        SCOPE_DRIVE_PHOTOS_READONLY,
        SCOPE_DRIVE_READONLY,
      )
    default:
      return false
  }
}

function toScope(permission: Permissions): string {
  switch (permission) {
    case Permissions.INSTALL:
      return SCOPE_INSTALL
    case Permissions.SAVE_SELECTED_FILE:
      return SCOPE_DRIVE_FILE
    case Permissions.READ_SELECTED_FILE:
    case Permissions.BROWSE_FILES:
    case Permissions.READ_FILE:
      return SCOPE_DRIVE_READONLY
    case Permissions.READ_FILE_METADATA:
      return SCOPE_DRIVE_METADATA_READONLY
    case Permissions.MAINTAIN_APP_DATA:
      return SCOPE_DRIVE_APPDATA
    case Permissions.READ_ABOUT:
      return SCOPE_DRIVE_APPDATA
  }
}
