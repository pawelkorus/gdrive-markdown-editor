import React from 'react'
import type { StorageApi } from '@app/storage'
import { StorageApiContext } from './StorageApiContext'

export function StorageApiProvider({ api, children }: { api: StorageApi, children?: React.ReactNode }): React.ReactElement {
  return <StorageApiContext.Provider value={api}>{children}</StorageApiContext.Provider>
}
