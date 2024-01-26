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

function initializeTokenClient() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPE_INSTALL,
    callback: async (tokenResponse: google.accounts.oauth2.TokenResponse) => {
      latestTokenResponse = tokenResponse

      if (!waitForTokenResult) return

      if (tokenResponse.error !== undefined) {
        waitForTokenResult.reject(tokenResponse.error)
      }

      waitForTokenResult.resolve(tokenResponse)
    },
  })
}

export function loadGis() {
  return new Promise((resolve) => {
    const gisEle = document.createElement('script') as HTMLScriptElement
    gisEle.defer = true
    gisEle.src = 'https://accounts.google.com/gsi/client'
    gisEle.addEventListener('load', () => {
      initializeTokenClient()
      resolve(true)
    })
    document.body.appendChild(gisEle)
  })
}

export async function authorizeFileAccess(userId?: string) {
  return new Promise((resolve, reject) => {
    waitForTokenResult = new TokenCallbackResult(resolve, reject)

    tokenClient!.requestAccessToken({
      scope: SCOPE_FILE_ACCESS + ' https://www.googleapis.com/auth/drive.readonly',
      hint: userId,
      include_granted_scopes: true,
    })
  })
}

export async function authorizeInstall() {
  return new Promise((resolve, reject) => {
    waitForTokenResult = new TokenCallbackResult(resolve, reject)

    tokenClient!.requestAccessToken({
      scope: SCOPE_INSTALL,
    })
  })
}

export function currentToken(): google.accounts.oauth2.TokenResponse {
  return latestTokenResponse!
}
