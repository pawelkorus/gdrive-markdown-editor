import { useState } from "react";
import { Item } from "./CommandPalette";

export default function useCommandItemFilter(commands:Item[]): [Item[], (query:string) => void] {
    const [filteredCommands, setFilteredCommands] = useState(commands);

    function byName(query:string) {
        setFilteredCommands(commands.filter(command => command.name.toLowerCase().includes(query.toLowerCase())))
    }

    return [filteredCommands, byName]
}
