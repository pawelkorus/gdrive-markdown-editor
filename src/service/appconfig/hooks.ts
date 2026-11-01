import { useContext } from 'react'
import { AppConfig, AppConfigContext } from './AppConfigContext'

export function useAppConfig(): AppConfig {
  return useContext(AppConfigContext).config
}

export function useUpdateAppConfig(): (config: AppConfig) => Promise<void> {
  return useContext(AppConfigContext).updateConfig
}
