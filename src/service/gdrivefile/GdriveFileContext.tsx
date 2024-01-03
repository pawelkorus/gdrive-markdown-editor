import React, { PropsWithChildren, useCallback, useState } from 'react';
import * as googleApi from "../../google"

export type FileDetails = googleApi.FileDetails;

export type GdriveFileContextState = {
    fileDetails: FileDetails,
    loadFile: (fileId:string, userId?: string) => Promise<void>,
    createFile: (fileName:string, folderId:string) => Promise<void>,
    updateContent: (content:string) => Promise<void>
    updateFileName: (fileName:string) => Promise<void>
}

// Create the context
const GdriveFileContext = React.createContext<GdriveFileContextState>({
    fileDetails: undefined,
    loadFile: () => { throw Error("GdriveFileContext not initialized"); },
    createFile: () => { throw Error("GdriveFileContext not initialized"); },
    updateContent: () => { throw Error("GdriveFileContext not initialized"); },
    updateFileName: () => { throw Error("GdriveFileContext not initialized"); }
});

export default GdriveFileContext;

export type Props = PropsWithChildren<object>;

export function GdriveFileContextProvider(props:Props):React.ReactElement {
    const [fileDetails, setFileDetails] = useState<FileDetails>({
        id: undefined,
        name: "",
        content: ""
    });

    const loadFile = useCallback(async (fileId:string, userId?: string) => {
        await googleApi.authorizeFileAccess(userId)
        const fileDetails = await googleApi.loadFile(fileId);
        setFileDetails(fileDetails);
    }, []);

    const updateContent = useCallback(async (content:string) => {
        await googleApi.save(fileDetails.id, content);
        setFileDetails({...fileDetails, content});
    }, []);

    const updateFileName = useCallback(async (fileName:string) => {
        await googleApi.updateFileName(fileDetails.id, fileName);
        setFileDetails({...fileDetails, name: fileName});
    }, []);

    const createFile = useCallback(async (folderId:string, userId?:string) => {
        await googleApi.authorizeFileAccess(userId)
        const fileDetails = await googleApi.createFile("Newfile.md", "", folderId)
        setFileDetails(fileDetails);
    }, []);

    const value = {
        fileDetails,
        loadFile,
        createFile,
        updateContent,
        updateFileName
    };

    return (
        <GdriveFileContext.Provider value={value}>
            {props.children}
        </GdriveFileContext.Provider>
    );
}
