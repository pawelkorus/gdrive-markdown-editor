import React, { PropsWithChildren, createContext, useCallback, useState } from 'react';
import { Command } from './Command';

type CommandsRegistry = Record<string, Command>

export type CommandsContextState = {
    commands: Command[]
    registerCommand: (command:Command|Command[]) => void
    unregisterCommand: (command:Command|Command[]) => void
    executeCommand: (commandId:string) => void
}

export const CommandsContext = createContext<CommandsContextState>({
    commands: [],
    registerCommand: () => { throw Error("CommandsContext not initialized"); },
    unregisterCommand: () => { throw Error("CommandsContext not initialized"); },
    executeCommand: () => { throw Error("CommandsContext not initialized"); }
});

type Props = PropsWithChildren<unknown>

export function CommandsContextProvider(props:Props):React.ReactElement {
    const [commandRegistry, setCommandRegistry] = useState<CommandsRegistry>({});
    const registerCommand = useCallback((command:Command|Command[]) => {
        if(!Array.isArray(command)) {
            command = [command]
        }
        const additionalCommands:CommandsRegistry = {};
        command.forEach(c => {
            if(!commandRegistry[c.id]) additionalCommands[c.id] = c;
        });
        
        if(Object.values(additionalCommands).length > 0) {
            console.log("Registering commands", additionalCommands);
            setCommandRegistry({...commandRegistry, ...additionalCommands});
        }
    }, [commandRegistry]);
    const unregisterCommand = useCallback((command:Command|Command[]) => {
        if(!Array.isArray(command)) {
            command = [command]
        }
        command.forEach(c => { delete commandRegistry[c.id]; });
        setCommandRegistry({...commandRegistry});
    }, [commandRegistry]);

    const executeCommand = useCallback((commandId:string) => {
        const command = commandRegistry[commandId];
        if(command) {
            command.execute();
        }
    }, [commandRegistry]);

    const value:CommandsContextState = {
        commands: Object.values(commandRegistry),
        registerCommand,
        unregisterCommand,
        executeCommand
    };

    return (
        <CommandsContext.Provider value={value}>
            {props.children}
        </CommandsContext.Provider>
    )
}
