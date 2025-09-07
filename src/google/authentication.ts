import * as jose from 'jose'
import { CLIENT_ID } from './const'
import { ensureGISLibraryLoaded } from './load'

interface User {
  id: string
  name: string
  email: string
  avatarUrl: string
}

export const authenticateUser = new Promise<User>((resolve) => {
  const handleAuthentication = async (res: google.accounts.id.CredentialResponse) => {
    const tokenPayload = await decodeJwtResponse(res.credential)

    resolve({
      id: tokenPayload.sub,
      name: tokenPayload.name as string,
      email: tokenPayload.email as string,
      avatarUrl: tokenPayload.picture as string,
    })
  }

  ensureGISLibraryLoaded.then(() => {
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response) => { void handleAuthentication(response) },
      itp_support: true,
      auto_select: true,
      use_fedcm_for_prompt: true,
    })

    google.accounts.id.prompt()
  })
  .catch(err => console.error(err))
})

const decodeJwtResponse = async (token: string) => {
  const JWKS = jose.createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

  const { payload } = await jose.jwtVerify(token, JWKS, {
    issuer: 'https://accounts.google.com',
    audience: CLIENT_ID,
  })
  return payload
}
