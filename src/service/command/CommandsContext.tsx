import React, { PropsWithChildren, createContext, useCallback, useRef, useState } from 'react'
import { Command } from './Command'

type CommandsRegistry = Record<string, Command>

export interface CommandsContextState {
  commands: Command[]
  registerCommand: (command: Command | Command[]) => void
  unregisterCommand: (command: Command | Command[]) => void
  executeCommand: (commandId: string) => void
}

export const CommandsContext = createContext<CommandsContextState>({
  commands: [],
  registerCommand: () => { throw Error('CommandsContext not initialized') },
  unregisterCommand: () => { throw Error('CommandsContext not initialized') },
  executeCommand: () => { throw Error('CommandsContext not initialized') },
})

type Props = PropsWithChildren<unknown>

export function CommandsContextProvider(props: Props): React.ReactElement {
  const commandRegistryRef = useRef<CommandsRegistry>({})
  const [commands, setCommands] = useState<Command[]>([])

  const registerCommand = useCallback((command: Command | Command[]) => {
    if (!Array.isArray(command)) {
      command = [command]
    }
    const commandRegistry = commandRegistryRef.current
    const additionalCommands: CommandsRegistry = {}

    command.forEach((c) => {
      if (!commandRegistry[c.id]) additionalCommands[c.id] = c
    })

    if (Object.values(additionalCommands).length > 0) {
      console.log('Registering commands', additionalCommands)
      console.log('Existing commands', commandRegistry)
      commandRegistryRef.current = { ...commandRegistry, ...additionalCommands }

      setCommands(Object.values(commandRegistryRef.current))
    }
  }, [])

  const unregisterCommand = useCallback((command: Command | Command[]) => {
    if (!Array.isArray(command)) {
      command = [command]
    }
    const commandRegistry = commandRegistryRef.current
    command.forEach((c) => {
      delete commandRegistry[c.id]
    })
    setCommands(Object.values(commandRegistry))
  }, [])

  const executeCommand = useCallback((commandId: string) => {
    const commandRegistry = commandRegistryRef.current
    const command = commandRegistry[commandId]
    if (command) {
      command.execute()
    }
  }, [])

  const value: CommandsContextState = {
    commands: commands,
    registerCommand,
    unregisterCommand,
    executeCommand,
  }

  return (
    <CommandsContext.Provider value={value}>
      {props.children}
    </CommandsContext.Provider>
  )
}
