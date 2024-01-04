import { useEffect, useMemo } from "react";
import { Command, useCommandManager } from "../service/command";
import { showFolderPicker, showMarkdownPicker } from "../google";
import { useGdriveFile, useGdriveFileCommands } from "../service/gdrivefile";

export const openMarkdownFileCmd = "openMarkdownFile";

export const createMarkdownFileCmd = "createMarkdownFile";

export default function useGlobalCommands() {
    const [, loadFile] = useGdriveFile();
    const {createFile} = useGdriveFileCommands();
    const [registerCommand, unregisterCommand] = useCommandManager();
    const commands:Command[] = useMemo(() => {
        const openMarkdownFile = {
            id: openMarkdownFileCmd,
            execute: async () => {
                const fileId = await showMarkdownPicker();
                if (fileId) {
                    loadFile(fileId);
                }
            },
            name: "Open markdown file"
        }
    
        const createMarkdownFile = {
            id: createMarkdownFileCmd,
            execute: async () => {
                const folderId = await showFolderPicker();
                if(folderId) {
                    createFile("Untitled", folderId);
                }
            },
            name: "Create markdown file"
        }
        
        return [openMarkdownFile, createMarkdownFile]
    }, []);

    

    useEffect(() => {
        registerCommand(commands);
        return () => unregisterCommand(commands);
    }, [commands]);
}
