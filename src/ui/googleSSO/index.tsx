import * as jose from 'jose'
import React, { useRef, useEffect } from 'react'
import { useUser } from '../../service/user'
import { CLIENT_ID } from '../../google'

const GoogleSSO = () => {
  const [user, setUser] = useUser()
  const g_sso = useRef(null)

  useEffect(() => {
    if (g_sso.current && !user) {
      const handleAuthentication = async (res: google.accounts.id.CredentialResponse) => {
        const tokenPayload = await decodeJwtResponse(res.credential)

        setUser({
          id: tokenPayload.sub,
          name: tokenPayload.name as string,
          email: tokenPayload.email as string,
          avatarUrl: tokenPayload.picture as string,
        })
      }

      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleAuthentication,
        itp_support: true,
        auto_select: true,
        use_fedcm_for_prompt: true,
      })

      google.accounts.id.prompt()
    }
  }, [g_sso.current, user])

  return (<div ref={g_sso} />)
}

export default GoogleSSO

const decodeJwtResponse = async (token: string) => {
  const JWKS = jose.createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

  const { payload } = await jose.jwtVerify(token, JWKS, {
    issuer: 'https://accounts.google.com',
    audience: CLIENT_ID,
  })
  return payload
}
