import React, { PropsWithChildren, createContext } from 'react';
import { Command } from './Command';

type CommandsRegistry = Record<string, Command>

export type CommandsContextState = {
    registerCommand: (command:Command) => void
    unregisterCommand: (command:Command) => void
    executeCommand: (commandId:string) => void
    getCommands: () => Command[]
}

export const CommandsContext = createContext<CommandsContextState>({
    registerCommand: () => { throw Error("CommandsContext not initialized"); },
    unregisterCommand: () => { throw Error("CommandsContext not initialized"); },
    executeCommand: () => { throw Error("CommandsContext not initialized"); },
    getCommands: () => { throw Error("CommandsContext not initialized"); }
});

export type Props = PropsWithChildren<unknown>

export function CommandsContextProvider(props:Props):React.ReactElement {
    const commandRegistry:CommandsRegistry = {};
    const state = {getCommands, registerCommand, unregisterCommand, executeCommand } as CommandsContextState;

    function getCommands() {
        return Object.values(commandRegistry) as Command[];
    }

    function registerCommand(command:Command) {
        commandRegistry[command.id] = command;
    }

    function unregisterCommand(command:Command) {
        delete commandRegistry[command.id];
    }

    function executeCommand(commandId:string) {
        const command = commandRegistry[commandId];
        if(command) {
            command.execute();
        }
    }

    return (
        <CommandsContext.Provider value={state}>
            {props.children}
        </CommandsContext.Provider>
    )
}
