import React from "react"
import {
    EditorView,
    ViewerView,
    NotificationView,
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
import { Button, Spinner } from "react-bootstrap"
import { CommandsContextProvider, useCommands } from "./service/command"
import { CommandPalette } from "./ui/commandPalette"
import { GdriveFileContextProvider } from "./service/gdrivefile/GdriveFileContext"
import { useGdriveFile, useGdriveFileCommands } from "./service/gdrivefile"
import { openMarkdownFileCmd } from "./ui/useGlobalCommands"

function RootView():React.ReactElement {
    const [message, setMessage] = useState(null)
    const [commands , executeCommand] = useCommands();
    const [,loadFile] = useGdriveFile();
    const {createFile} = useGdriveFileCommands();
    const [view, setView] = useState("loading")
    useGlobalCommands()

    useEffect(() => {
        const googleApi = async function() {
            const googleState = await Promise.all([loadGapi(), loadGis()]).then(initializeGapiClient).then(parseGoogleState)
        
            if(StateFromGoogleAction.Open == googleState.action) {
                try {
                    await loadFile(googleState.fileId, googleState.userId)
                    setViewerView();
                } catch(e : unknown) {
                    console.error(e);
                    setNotificationView("Can't load file. " + e);
                }
            } else if(StateFromGoogleAction.New == googleState.action) {
                try {
                    createFile(googleState.folderId);
                    setEditorView();
                } catch(e: unknown) {
                    console.error(e);
                    setNotificationView("Can't create file. " + e);
                }
            } else if(StateFromGoogleAction.Install == googleState.action) {
                try {
                    await authorizeInstall();
                    setNotificationView("Application installed into your google drive successfully.")
                } catch (e : unknown) {
                    setNotificationView("Can't install app into you google drive." + e)
                }
            } else {
                setNotificationView("Unknown action " + googleState.action);
            }
        }
        
        googleApi()
    }, [])

    const enableEditMode = () => {
        setEditorView();
    };

    const closeEditMode = () => {
        setViewerView();
    };

    const setEditorView = () => {
        setView("editor");
    };

    const setViewerView = () => {
        setView("viewer");
    };

    const setNotificationView = (message?:string) => {
        setMessage(message);
        setView("notification");
    };

    return  (<>
    { view === "loading" && <div className="container-fluid h-100 d-flex">
        <div className="mx-auto my-auto">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    </div> }
    { view === "notification" && <NotificationView message={message}>
            <Button onClick={() => executeCommand(openMarkdownFileCmd)}></Button>
        </NotificationView> }
    { view === "editor" && <EditorView onCloseClicked={closeEditMode} /> }
    { view === "viewer" && <ViewerView onEditClicked={enableEditMode}/> }
    { view !== "loading" && <CommandPalette commands={commands} onItemSelected={(item) => executeCommand(item.id)}></CommandPalette> }
</>
)}

export default ():React.ReactElement => {
    return (
<GdriveFileContextProvider>
    <CommandsContextProvider>
        <RootView />
    </CommandsContextProvider>
</GdriveFileContextProvider>
    )
}
