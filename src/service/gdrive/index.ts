import { authorizeInstall as authorizeInstall } from '@app/google'
import { hasPermission, PermissionCheckResult, Permissions } from '@app/google/authorization'
import { useCallback, useEffect, useState } from 'react'

export enum IntegrationStatus {
  LOADING,
  INTEGRATED,
  NOT_INTEGRATED,
}

export function useGdriveIntegration() {
  const [integrationStatus, setIntegrationStatus] = useState(IntegrationStatus.LOADING)

  const integrate = useCallback(async () => {
    await authorizeInstall()
    setIntegrationStatus(IntegrationStatus.INTEGRATED)
  }, [])

  useEffect(() => {
    let currentTimeoutId: string | number | NodeJS.Timeout = null

    function verifyInstallation() {
      if (hasPermission(Permissions.INSTALL) == PermissionCheckResult.PENDING) {
        currentTimeoutId = setTimeout(() => verifyInstallation(), 1000)
      }
      else {
        setIntegrationStatus(
          hasPermission(Permissions.INSTALL) == PermissionCheckResult.GRANTED
            ? IntegrationStatus.INTEGRATED
            : IntegrationStatus.NOT_INTEGRATED,
        )
      }
    }

    verifyInstallation()

    return () => {
      if (currentTimeoutId) {
        clearTimeout(currentTimeoutId)
      }
    }
  }, [])

  return {
    integrationStatus,
    integrate,
  }
}
