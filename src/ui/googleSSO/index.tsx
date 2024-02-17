import React, { useRef, useEffect } from 'react'

const GoogleSSO = () => {
  const g_sso = useRef(null)

  useEffect(() => {
    if (g_sso.current) {
      google.accounts.id.initialize({
        client_id: 'xxxxxxxx-koik0niqorls18sc92nburjfgbe2p056.apps.googleusercontent.com',
        callback: (res: google.accounts.id.CredentialResponse) => {
          // This is the function that will be executed once the authentication with google is finished
        },
      })
      google.accounts.id.renderButton(g_sso.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 220,
      })
    }
  }, [g_sso.current])

  return (<div ref={g_sso} />)
}

export default GoogleSSO
