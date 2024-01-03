import { useContext } from "react";
import GdriveFileContext from "./GdriveFileContext";
import { FileDetails } from "./GdriveFileContext";

export function useGdriveFile(): [FileDetails, (fileId: string, userId?: string) => void] {
    const gdriveFileContext = useContext(GdriveFileContext);

    return [gdriveFileContext.fileDetails, gdriveFileContext.loadFile]
}

type GdriveFileCommands = {
    createFile: (folderId:string, userId?:string) => Promise<void>,
    updateContent: (newContent:string) => Promise<void>,
    updateFileName: (newName:string) => Promise<void>
}

export function useGdriveFileCommands():GdriveFileCommands {
    const gdriveFileContext = useContext(GdriveFileContext);

    return {
        createFile: gdriveFileContext.createFile,
        updateContent: gdriveFileContext.updateContent,
        updateFileName: gdriveFileContext.updateFileName
    }
}
