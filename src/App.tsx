import React from "react"
import {
    Editor,
    Viewer,
    NotificationView,
    SaveEvent
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
import {
    loadFile,
    save,
    createFile
} from "./service"
import { Spinner } from "react-bootstrap"

type Props = {

}

export default ({}:Props):React.ReactElement => {
    const [loading, setLoading] = useState(true)
    const [content, setContent] = useState("Initializing"); 
    const [editMode, setEditMode] = useState(false)
    const [message, setMessage] = useState(null)

    useEffect(() => {
        const googleApi = async function() {
            const googleState = await Promise.all([loadGapi(), loadGis()]).then(initializeGapiClient).then(parseGoogleState)
        
            if(StateFromGoogleAction.Open == googleState.action) {
                try {
                    const content = await loadFile(googleState.fileId, googleState.userId);
                    setContent(content)
                    setEditMode(false)
                } catch(e : unknown) {
                    console.error(e);
                    setMessage("Can't load file. " + e);
                }
            } else if(StateFromGoogleAction.New == googleState.action) {
                try {
                    const content = await createFile("Newfile.md", googleState.folderId);
                    setContent(content);
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
            setContent('Initialized')
        }
    }, [])

    function enableEditMode() {
        setEditMode(true)
    }

    function closeEditMode() {
        setEditMode(false)
    }

    async function saveContent(e:SaveEvent) {
        await save(e.content);
        setContent(e.content)
    }

    return loading? 
    <div className="container-fluid h-100 d-flex">
        <div className="mx-auto my-auto">
            <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
            </Spinner>
        </div>
    </div>
    : 
    <NotificationView message={message}>
        {editMode && <Editor content={content} onCloseClicked={closeEditMode} onSaveClicked={saveContent}/>}

        {!editMode && <Viewer content={content} onEditClicked={enableEditMode}/>}
    </NotificationView>
}
