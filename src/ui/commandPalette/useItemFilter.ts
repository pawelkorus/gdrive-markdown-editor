import { useState } from "react";
import { CommandPaletteItem } from "./types";

export default function useCommandItemFilter(commands:CommandPaletteItem[]): [CommandPaletteItem[], (query:string) => void] {
    const [filteredCommands, setFilteredCommands] = useState(commands);

    function byName(query:string) {
        setFilteredCommands(commands.filter(command => command.name.toLowerCase().includes(query.toLowerCase())))
    }

    return [filteredCommands, byName]
}
