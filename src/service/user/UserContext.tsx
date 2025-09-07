import React, { PropsWithChildren, createContext, useEffect, useState } from 'react'
import { authenticateUser } from '../../google'

export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string
}

export interface UserContextState {
  user: User | null
}

export const UserContext = createContext<UserContextState>({
  user: null,
})

type Props = PropsWithChildren<unknown>

export function UserContextProvider(props: Props): React.ReactElement {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function waitForUser() {
      const authenticatedUser = await authenticateUser
      setUser(authenticatedUser)
    }

    void waitForUser()
  }, [])

  return (
    <UserContext.Provider value={{ user }}>
      {props.children}
    </UserContext.Provider>
  )
}
