import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { StorageApiProvider, useStorageApi } from '@app/service/storage'
import { createFakeStorageApi } from '@test/test-utils'

describe('useStorageApi', () => {
  it('throws without provider', () => {
    expect(() => renderHook(() => useStorageApi())).toThrow(/StorageApiProvider/)
  })

  it('returns injected api', () => {
    const api = createFakeStorageApi()
    const { result } = renderHook(() => useStorageApi(), {
      wrapper: ({ children }) => <StorageApiProvider api={api}>{children}</StorageApiProvider>,
    })
    expect(result.current).toBe(api)
  })
})
