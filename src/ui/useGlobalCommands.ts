import { useEffect, useMemo } from "react";
import { Command, useCommandManager } from "../service/command";
import { showMarkdownPicker } from "../google";
import { useGdriveFile } from "../service/gdrivefile";

export const openMarkdownFileCmd = "openMarkdownFile";

export default function useGlobalCommands() {
    const [, loadFile] = useGdriveFile();
    const [registerCommand, unregisterCommand] = useCommandManager();
    const commands:Command[] = useMemo(() => [{
        id: openMarkdownFileCmd,
        execute: async () => {
            const fileId = await showMarkdownPicker();
            if (fileId) {
                loadFile(fileId);
            }
        },
        name: "Open markdown file",
    }], []);

    useEffect(() => {
        registerCommand(commands);
        return () => unregisterCommand(commands);
    }, [commands]);
}
