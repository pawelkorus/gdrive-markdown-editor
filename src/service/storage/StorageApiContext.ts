import { createContext } from 'react'
import type { StorageApi } from '@app/storage'

export const StorageApiContext = createContext<StorageApi | undefined>(undefined)
