import { Errors, TokenResponse } from './types'
import { authenticateUser } from './authentication'
import { CLIENT_ID, SCOPE_DRIVE_APPDATA, SCOPE_DRIVE_READONLY, SCOPE_DRIVE_FILE, SCOPE_INSTALL, SCOPE_DRIVE, SCOPE_DRIVE_METADATA, SCOPE_DRIVE_PHOTOS_READONLY, SCOPE_DRIVE_METADATA_READONLY } from './const'
import { ensureGISLibraryLoaded } from './load'
import { TokenResponseListener, TokenResponseNotifier } from './TokenResponseNotifier'

const tokenNotifier = new TokenResponseNotifier()
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
        const expiresAt = tokenResponse.expires_in ? Date.now() + Number(tokenResponse.expires_in) * 1000 : 0

        const tokenResponseWithExpiration = {
          ...tokenResponse,
          expiresAt: expiresAt - 30000, // 30 seconds before expiration
        }

        if (!tokenResponseWithExpiration.error) {
          latestTokenResponse = tokenResponseWithExpiration
        }

        tokenNotifier.notify(tokenResponseWithExpiration)
      },
    })
  }

  return tokenClient
}

export async function ensurePermissionGranted(permission: Permissions) {
  if (hasPermission(permission) == PermissionCheckResult.GRANTED)
    return currentPermissionRequest

  const result = new Promise<void>((resolve, reject) => {
    const listener: TokenResponseListener = (token) => {
      tokenNotifier.removeListener(listener)
      if (!token.error) {
        if (hasGrantedPermission(token, permission)) {
          resolve()
        }
        else {
          reject(new Error(Errors.PERMISSION_DENIED))
        }
      }
      else {
        reject(token.error)
      }
    }

    tokenNotifier.addListener(listener)

    requestAccess(permission)
  })

  currentPermissionRequest = currentPermissionRequest.then(() => result)
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
  MAINTAIN_ALL_FILES = 'MAINTAIN_ALL_FILES',
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

export async function requestAccess(requiredPesmission: Permissions) {
  const tokenClient = await ensureTokenClient()

  const user = await authenticateUser

  tokenClient.requestAccessToken({
    scope: toScope(requiredPesmission),
    hint: user.id,
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
    case Permissions.MAINTAIN_ALL_FILES:
      return google.accounts.oauth2.hasGrantedAnyScope(token,
        SCOPE_DRIVE,
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
    case Permissions.MAINTAIN_ALL_FILES:
      return SCOPE_DRIVE
  }
}
