import { useContext } from 'react'
import type { StorageApi } from '@app/storage'
import { StorageApiContext } from './StorageApiContext'

export function useStorageApi(): StorageApi {
  const api = useContext(StorageApiContext)
  if (!api) {
    throw new Error('useStorageApi must be used within a StorageApiProvider')
  }
  return api
}
