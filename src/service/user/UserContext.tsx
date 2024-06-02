import React, { PropsWithChildren, createContext, useState } from 'react'

export type User = {
  id: string
  name: string
  email: string
  avatarUrl: string
}

export type UserContextState = {
  user: User | null
  setUser: (user: User) => void
}

export const UserContext = createContext<UserContextState>({
  user: null,
  setUser: () => { throw Error('CommandsContext not initialized') },
})

type Props = PropsWithChildren<unknown>

export function UserContextProvider(props: Props): React.ReactElement {
  const [user, setUser] = useState<User | null>(null)

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {props.children}
    </UserContext.Provider>
  )
}
