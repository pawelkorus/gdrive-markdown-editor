import { useEffect, useMemo } from "react";
import { Command, useCommandManager } from "../service/command";
import { showMarkdownPicker } from "../google";

export default function useGlobalCommands() {
    const [registerCommand, unregisterCommand] = useCommandManager();
    const commands:Command[] = useMemo(() => [{
        id: "openMarkdownFile",
        execute: async () => {
            const fileId = await showMarkdownPicker();
            if (fileId) {
                console.log("Opening file", fileId);
            }
        },
        name: "Open markdown file",
    }], []);

    useEffect(() => {
        registerCommand(commands);
        return () => unregisterCommand(commands);
    }, [commands]);
}
