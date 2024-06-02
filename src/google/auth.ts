import { CLIENT_ID, SCOPE_FILE_ACCESS, SCOPE_INSTALL } from './const'

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

let waitForTokenResult: TokenCallbackResult
let latestTokenResponse: google.accounts.oauth2.TokenResponse | undefined = undefined
let tokenClient: google.accounts.oauth2.TokenClient | undefined = undefined

export function initializeTokenClient(loginHint: string | undefined) {
  console.log(loginHint)
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPE_INSTALL,
    prompt: '',
    callback: async (tokenResponse: google.accounts.oauth2.TokenResponse) => {
      latestTokenResponse = tokenResponse

      if (!waitForTokenResult) return

      if (tokenResponse.error !== undefined) {
        waitForTokenResult.reject(tokenResponse.error)
      }

      waitForTokenResult.resolve(tokenResponse)
    },
    login_hint: loginHint,
  })
}

export function loadGis() {
  return new Promise((resolve) => {
    const gisEle = document.createElement('script') as HTMLScriptElement
    gisEle.defer = true
    gisEle.src = 'https://accounts.google.com/gsi/client'
    gisEle.addEventListener('load', () => {
      resolve(true)
    })
    document.body.appendChild(gisEle)
  })
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
}

export function currentToken(): google.accounts.oauth2.TokenResponse {
  return latestTokenResponse!
}

export function requestAccess(requiredPesmission: Permissions, userId?: string): Promise<unknown> {
  function toScope(permission: Permissions): string {
    switch (permission) {
      case Permissions.INSTALL:
        return SCOPE_INSTALL
      case Permissions.SAVE_SELECTED_FILE:
      case Permissions.READ_SELECTED_FILE:
      case Permissions.BROWSE_FILES:
      case Permissions.READ_FILE:
        return SCOPE_FILE_ACCESS
    }
  }

  return new Promise((resolve, reject) => {
    waitForTokenResult = new TokenCallbackResult(resolve, reject)

    tokenClient!.requestAccessToken({
      scope: toScope(requiredPesmission),
      hint: userId,
    })
  })
}

export function hasPermission(permission: Permissions): boolean {
  if (!latestTokenResponse) return false

  switch (permission) {
    case Permissions.SAVE_SELECTED_FILE:
      return google.accounts.oauth2.hasGrantedAnyScope(latestTokenResponse, SCOPE_FILE_ACCESS)
    case Permissions.READ_SELECTED_FILE:
      return google.accounts.oauth2.hasGrantedAnyScope(latestTokenResponse, SCOPE_FILE_ACCESS)
    case Permissions.BROWSE_FILES:
      return google.accounts.oauth2.hasGrantedAnyScope(latestTokenResponse, SCOPE_FILE_ACCESS)
    case Permissions.READ_FILE:
      return google.accounts.oauth2.hasGrantedAnyScope(latestTokenResponse, SCOPE_FILE_ACCESS)
    case Permissions.INSTALL:
      return google.accounts.oauth2.hasGrantedAnyScope(latestTokenResponse, SCOPE_INSTALL)
    default:
      return false
  }
}
