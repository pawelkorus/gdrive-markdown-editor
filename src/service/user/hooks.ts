import { useContext } from 'react'
import { User, UserContext } from './UserContext'

export function useUser(): [User | null, (user: User) => void] {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useUser must be used within a UserContextProvider')
  }

  return [context.user, context.setUser]
}
