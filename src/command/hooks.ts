import { useContext } from "react";
import { CommandsContext } from "./CommandsContext";
import { Command } from "./Command";

export function useCommands(): [Command[], (id: string) => void] {
  const commandsContext = useContext(CommandsContext);

  return [ commandsContext.getCommands(), commandsContext.executeCommand ];
}

export function useCommandManager() {
    const commandsContext = useContext(CommandsContext);

    return [commandsContext.registerCommand, commandsContext.unregisterCommand]
}

export function useCommand() {
    const commandsContext = useContext(CommandsContext);

    return [ commandsContext.executeCommand ]
}
