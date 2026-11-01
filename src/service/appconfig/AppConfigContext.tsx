import React, { PropsWithChildren, createContext, useEffect, useState } from 'react'
import JSON5 from 'json5'
import { StorageContext } from '@app/storage'
import { useStorageApi } from '@app/service/storage'
import { useUser } from '@app/service/user'

export interface AppConfig {
  testConfig: string
}

export const defaultAppConfig: AppConfig = {
  testConfig: 'default',
}

export const APP_CONFIG_FILENAME = 'config.json5'

export function createConfigContent(config: AppConfig): string {
  const lines = Object.entries(config).map(([key, value]) => `  // ${key}: ${JSON5.stringify(value)},`)
  return `{\n${lines.join('\n')}\n}\n`
}

export interface AppConfigContextState {
  config: AppConfig
  loaded: boolean
  updateConfig: (config: AppConfig) => Promise<void>
}

export const AppConfigContext = createContext<AppConfigContextState>({
  config: defaultAppConfig,
  loaded: false,
  updateConfig: () => Promise.reject(new Error('AppConfigProvider is missing')),
})

export function serializeAppConfig(config: AppConfig): string {
  return JSON5.stringify(config, null, 2) + '\n'
}

export function parseAppConfig(content: string): AppConfig {
  const parsed: unknown = JSON5.parse(content)
  const result: AppConfig = { ...defaultAppConfig }
  if (parsed && typeof parsed === 'object') {
    const { testConfig } = parsed as Record<string, unknown>
    if (typeof testConfig === 'string') result.testConfig = testConfig
  }
  return result
}

export function AppConfigProvider({ children }: PropsWithChildren<unknown>): React.ReactElement {
  const api = useStorageApi()
  const [user] = useUser()
  const [state, setState] = useState<{ config: AppConfig, loaded: boolean }>({ config: defaultAppConfig, loaded: false })

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      let config = defaultAppConfig
      try {
        const context = StorageContext.AppConfig
        const files = await api.findFiles({ filename: APP_CONFIG_FILENAME, context })
        if (files.length > 0) {
          const file = await api.loadFile({ fileId: files[0].id, context })
          config = parseAppConfig(file.content)
        } else {
          await api.createFile({ filename: APP_CONFIG_FILENAME, content: createConfigContent(defaultAppConfig), context })
        }
      } catch (e) {
        console.error('Failed to load application configuration, using defaults', e)
      }
      if (!cancelled) setState({ config, loaded: true })
    }

    void load()
    return () => { cancelled = true }
  }, [api, user])

  const updateConfig = async (config: AppConfig) => {
    const context = StorageContext.AppConfig
    const content = serializeAppConfig(config)
    const files = await api.findFiles({ filename: APP_CONFIG_FILENAME, context })
    if (files.length > 0) {
      await api.saveFile({ fileId: files[0].id, content, context })
    } else {
      await api.createFile({ filename: APP_CONFIG_FILENAME, content, context })
    }
    setState({ config, loaded: true })
  }

  return <AppConfigContext.Provider value={{ ...state, updateConfig }}>{children}</AppConfigContext.Provider>
}
