import React from "react"
import {
    EditorView,
    ViewerView,
    NotificationView,
    SaveEvent,
    FileNameChangeEvent,
    useGlobalCommands
} from "./ui"
import { useEffect, useState } from 'react'
import { 
    loadGapi, 
    loadGis, 
    initializeGapiClient, 
    parseGoogleState, 
    StateFromGoogleAction,
    authorizeInstall,
} from "./google"
import { Spinner } from "react-bootstrap"
import { CommandsContextProvider, useCommands } from "./command"
import { CommandPalette } from "./ui/commandPalette"
import { GdriveFileContextProvider } from "./service/gdrivefile/GdriveFileContext"
import { useGdriveFile, useGdriveFileCommands } from "./service/gdrivefile"

function RootView():React.ReactElement {
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [message, setMessage] = useState(null)
    const [ , executeCommand ] = useCommands();
    const [ fileDetails, loadFile ] = useGdriveFile();
    const { createFile, updateContent, updateFileName } = useGdriveFileCommands();
    useGlobalCommands()

    useEffect(() => {
        const googleApi = async function() {
            const googleState = await Promise.all([loadGapi(), loadGis()]).then(initializeGapiClient).then(parseGoogleState)
        
            if(StateFromGoogleAction.Open == googleState.action) {
                try {
                    await loadFile(googleState.fileId, googleState.userId)
                    setEditMode(false)
                } catch(e : unknown) {
                    console.error(e);
                    setMessage("Can't load file. " + e);
                }
            } else if(StateFromGoogleAction.New == googleState.action) {
                try {
                    createFile(googleState.folderId);
                    setEditMode(true);
                } catch(e: unknown) {
                    console.error(e);
                    setMessage("Can't create file. " + e);
                }
            } else if(StateFromGoogleAction.Install == googleState.action) {
                try {
                    await authorizeInstall();
                    setMessage("Application installed into your google drive successfully.")
                } catch (e : unknown) {
                    setMessage("Can't install app into you google drive." + e)
                }
            }

            setLoading(false)
        }
        
        if(loading) {
            googleApi()
        }
    }, [])

    const enableEditMode = () => {
        setEditMode(true)
    };

    const closeEditMode = () => {
        setEditMode(false)
    };

    const saveContent = async (e:SaveEvent) => {
        await updateContent(e.content);
    };

    const handleFileNameChange = async (e:FileNameChangeEvent) => {
        await updateFileName(e.fileName)
    };

    return loading? 
    <div className="container-fluid h-100 d-flex">
        <div className="mx-auto my-auto">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    </div>
    : 
    <CommandPalette onItemSelected={(item) => executeCommand(item.id)}>
        <NotificationView message={message}>
            {editMode && <EditorView 
                fileName={fileDetails.name}
                content={fileDetails.content} 
                onCloseClicked={closeEditMode} 
                onSaveClicked={saveContent}
                onFileNameChanged={handleFileNameChange}
            />
            }

            {!editMode && <ViewerView content={fileDetails.content} onEditClicked={enableEditMode}/> }
        </NotificationView>
    </CommandPalette>
}

export default ():React.ReactElement => {
    return (
<GdriveFileContextProvider>
    <CommandsContextProvider>
                <RootView />
    </CommandsContextProvider>
</GdriveFileContextProvider>
    )
}
