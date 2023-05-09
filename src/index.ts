import './main.scss';
import { default as showdown } from 'showdown'
import { assign, createMachine, interpret } from "xstate";
import { sendTo } from 'xstate/lib/actions';

interface StateFromGoogle {
    action: StateFromGoogleAction
    fileId: string
    userId: string
}

enum StateFromGoogleAction {
    New,
    Open,
    Install,
    Unsupported
}

interface Context {
    action: StateFromGoogleAction,
    fileId: string,
    userId: string
}

type Events = {type: "edit"}   
| {type: "saved"}
| {type: "save"} 
| {type: "close"} 
| {type: "toggle preview"}
| {type: "scripts loaded"} 
| {type: "google state processed"}
| {type: "google state processing" }
| {type: "google state invalid"}
| {type: "file loaded"}
| {type: "process google state"}
| {type: "on error"}
| {type: "editButtonClicked"}
| {type: "previewButtonClicked"}
| {type: "saveButtonClicked"}
| {type: "closeButtonClicked"}
| {type: "contentChanged"}
| {type: "enableEditMode"}
| {type: "togglePreview"}
| {type: "closeEditor"}

(function() {

    const converter: showdown.Converter = new showdown.Converter();
    const CLIENT_ID = "413355556847-pd76u4ckm8d8jisjg2fmlamgisejh4nn.apps.googleusercontent.com";
    const API_KEY = "AIzaSyCQLy4XRrT2HWbALEcxhSf2rWNoeQvT6bA";
    const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
    const SCOPE_FILE_ACCESS = "https://www.googleapis.com/auth/drive.file"
    const SCOPE_INSTALL = "https://www.googleapis.com/auth/drive.install"

    async function initializeGapiClient() {
      await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        })
    }

    function loadGapi() {
      return new Promise((resolve, reject) => {
          const apiEle = document.createElement('script') as HTMLScriptElement
          apiEle.defer = true
          apiEle.src = "https://apis.google.com/js/api.js"
          apiEle.addEventListener("load", () => {
            gapi.load('client', () => resolve(true))
          })
          document.body.appendChild(apiEle)
      })
    }

    function loadGis() {
        return new Promise((resolve, reject) => {
            const gisEle = document.createElement('script') as HTMLScriptElement
            gisEle.defer = true
            gisEle.src = "https://accounts.google.com/gsi/client"
            gisEle.addEventListener("load", () => { resolve(true) })
            document.body.appendChild(gisEle)
        })
    }

    async function parseGoogleState():Promise<StateFromGoogle> {
        const searchParams = new URLSearchParams(window.location.search)
    
        // https://developers.google.com/drive/api/guides/integrate-open
        const state = JSON.parse(searchParams.get("state"));
        if(state == null) {
            return {
                action: StateFromGoogleAction.Install,
                fileId: "",
                userId: ""
            }
        }

        const fileIds = state["ids"] as Array<string>;
        if(fileIds.length != 1) throw Error("Invalid state parameter: to many file ids");

        let action = StateFromGoogleAction.Unsupported
        if(state["action"] == "open") action = StateFromGoogleAction.Open
        if(state["action"] == "new") action = StateFromGoogleAction.New

        const userId = state["userId"]

        return {
            action: action,
            fileId: fileIds[0],
            userId: userId
        }
    }

    async function authorizeInstall() {
        return new Promise((resolve, reject) => {
            const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPE_INSTALL,
                callback: async (tokenResponse:google.accounts.oauth2.TokenResponse) => {
                    if (tokenResponse.error !== undefined) {
                        throw (tokenResponse);
                    }

                    resolve(true)
                }
            });

            tokenClient.requestAccessToken({
                prompt: 'consent',
            });
        })
    }

    async function authorizeFileAccess(userId: string) {
        return new Promise((resolve, reject) => {
            const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPE_FILE_ACCESS,
                callback: async (tokenResponse:google.accounts.oauth2.TokenResponse) => {
                    if (tokenResponse.error !== undefined) {
                        throw (tokenResponse);
                    }

                    resolve(true)
                }
            })
                
            tokenClient.requestAccessToken({
                prompt: '',
                hint: userId
            });
        })
    }

    async function loadFile(fileId:string) {
        // https://developers.google.com/drive/api/v3/reference/files
        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: "media"
        })
        return response.body
    }

    async function save(fileId:string, content:string) {
        // according to https://stackoverflow.com/questions/40600725/google-drive-api-v3-javascript-update-file-contents
        // google drive javascript library doesn't support body upload
        await gapi.client.request({
            path: "/upload/drive/v3/files/" + fileId,
            method: "PATCH",
            params: {
                uploadType: "media"
            },
            body: content
        })
    }

    function logInvokeFail(context:any, event:any) {
        console.log(event.data)
    }

    function updateViewer(content:string) {
        const viewer = document.getElementById("viewer") as HTMLDivElement
        const html = converter.makeHtml(content);
        viewer.innerHTML = html;
    }

    function toggleViewer() {
        const viewer = document.getElementById("viewer") as HTMLDivElement
        viewer.classList.toggle("d-none")
    }

    function enterViewerView(content:string) {
        const viewer = document.getElementById("viewer") as HTMLDivElement
        viewer.classList.remove("d-none")
        
        const editBtn = document.getElementById("btn-edit")
        editBtn.classList.remove("d-none")
        
        updateViewer(content)
    }

    function exitViewerView() {
        const viewer = document.getElementById("viewer") as HTMLDivElement
        viewer.classList.add("d-none")

        const editBtn = document.getElementById("btn-edit")
        editBtn.classList.add("d-none")
    }

    function enterEditorView(content:string) {
        const editorEle = document.getElementById("editor") as HTMLDivElement
        editorEle.classList.remove("d-none")
        const textArea = editorEle.getElementsByTagName("textarea").item(0) as HTMLTextAreaElement
        textArea.value = content

        const viewer = document.getElementById("viewer") as HTMLDivElement
        viewer.classList.remove("d-none")

        const saveBtn = document.getElementById("btn-save")
        saveBtn.classList.remove("d-none")

        const previewBtn = document.getElementById("btn-preview")
        previewBtn.classList.remove("d-none")

        const closeBtn = document.getElementById("btn-close")
        closeBtn.classList.remove("d-none")

        updateViewer(content)
    }

    function exitEditorView() {
        const editorEle = document.getElementById("editor") as HTMLDivElement
        editorEle.classList.add("d-none")

        const viewer = document.getElementById("viewer") as HTMLDivElement
        viewer.classList.add("d-none")

        const saveBtn = document.getElementById("btn-save")
        saveBtn.classList.add("d-none")

        const previewBtn = document.getElementById("btn-preview")
        previewBtn.classList.add("d-none")

        const closeBtn = document.getElementById("btn-close")
        closeBtn.classList.add("d-none")
    }

    function getEditorContent() {
        const editorEle = document.getElementById("editor") as HTMLDivElement
        const textArea = editorEle.getElementsByTagName("textarea").item(0) as HTMLTextAreaElement
        return textArea.value
    }

    const handleFile = createMachine({
        "predictableActionArguments": true,
        "id": "handleFile",
        "initial": "Loading file",
        "context": {
            action: StateFromGoogleAction.New,
            fileId: "",
            userId: "",
            content: ""
        },
        "states": {
            "Loading file": {
                invoke: {
                    src: (context, event) => 
                        Promise.resolve("# Hello world")
                        // authorizeFileAccess(context.userId)
                        //     .then(() => loadFile(context.fileId))
                        ,
                    onDone: {
                        target: "Loaded",
                        actions: [
                            assign({content: (context, event) => event.data})
                        ]
                    },
                    onError: {
                        target: "Error",
                        actions: logInvokeFail
                    }
                }
            },
            "Loaded": {
                always: [
                    {
                        target: "Viewing",
                        cond: (context, event) => context.action == StateFromGoogleAction.Open
                    },
                    {
                        target: "Editing"
                    }
                ]
            },
            "Viewing": {
                entry: [
                    (context, event) => { enterViewerView(context.content) }
                ],
                exit: [
                    () => exitViewerView()
                ],
                on: {
                    "enableEditMode": {
                        target: "Editing"
                    }
                }
            },
            "Editing": {
                initial: "Typing",
                entry: [
                    (context, event) => enterEditorView(context.content)
                ],
                exit: [
                    (context, event) => exitEditorView()
                ],
                states: {
                    "Typing": {
                        on: {
                            "save": {
                                target: "Saving",
                                actions: [
                                    assign({
                                        content: () => getEditorContent()
                                    })
                                ]
                            },
                            "closeEditor": {
                                target: "Exiting"
                            },
                            "contentChanged": {
                                target: "Typing",
                                actions: [
                                    assign({
                                        content: () => getEditorContent()
                                    }),
                                    (context) => updateViewer(context.content)
                                ]
                            },
                            "togglePreview": {
                                target: "Typing",
                                actions: [
                                    () => toggleViewer()
                                ]
                            }
                        }
                    },
                    "Saving": {
                        invoke: {
                            src: (context, event) => save(context.fileId, context.content),
                            onDone: "Typing",
                            onError: "Typing"
                        }
                    },
                    "Exiting": {
                        type: "final"
                    }
                },
                onDone: "Viewing"
            },
            "Error": {
                type: 'final'
            }
        },
        schema: {
            context: {} as {
                action: StateFromGoogleAction,
                fileId: string,
                userId: string,
                content: string
            }
        }
    })

    const machine = createMachine({
        "predictableActionArguments": true,
        "id": "Gdrive editor",
        "initial": "Initialize",
        "context": {
          action: StateFromGoogleAction.Unsupported,
          fileId: "",
          userId: ""
        },
        "states": {
            "Initialize": {
                "invoke": {
                    src: (context, event) => Promise.all([loadGapi(), loadGis()]).then(initializeGapiClient).then(parseGoogleState),
                    onDone: {
                        target: "Routing",
                        actions: assign((context, event) => {
                            return {
                                action: event.data.action,
                                fileId: event.data.fileId,
                                userId: event.data.userId
                            }
                        })
                    },
                    onError: "Error view"
                }
            },
            "Routing": {
                always: [
                    {
                        target: "Handling file",
                        cond: "isOpenAction"
                    },
                    {
                        target: "Handling file",
                        cond: "isNewAction"
                    },
                    {
                        target: "Installing",
                        cond: "isInstallAction"
                    },
                    { target: "App info" }
                ]
            },
            "Installing": {
                invoke: {
                    src: (context, event) => authorizeInstall,
                    onDone: "App info",
                    onError: "Error view"
                }
            },
            "Handling file": {
                invoke: {
                    id: "handleFile",
                    src: handleFile,
                    autoForward: true,
                    data: {
                        action: (context:any) => context.action,
                        fileId: (context:any) => context.fileId,
                        userId: (context:any) => context.userId
                    }
                }
            },
            "App info": {

            },
            "Error view": {
                "type": "final"
            }
        },
        "schema": {
            events: {} as Events,
            context: {} as Context
        },
      },
      {
        actions: {
        },
        services: {
        },
        guards: {
            isOpenAction: (context, event) => StateFromGoogleAction.Open == context.action,
            isNewAction: (context, event) => StateFromGoogleAction.New == context.action,
            isInstallAction: (context, event) => StateFromGoogleAction.Install == context.action
        }
      }
    )
    const machineService = interpret(machine)
      .onTransition((state) => { console.log(state.value) })
      .start()

    const editBtn = document.getElementById("btn-edit") as HTMLButtonElement
    editBtn.onclick = function(ev:MouseEvent) {
        machineService.send("enableEditMode")
    }

    const previewBtn = document.getElementById("btn-preview") as HTMLButtonElement
    previewBtn.onclick = function(ev:MouseEvent) {
        machineService.send("togglePreview")
    }

    const saveBtn = document.getElementById("btn-save") as HTMLButtonElement
    saveBtn.onclick = function(ev:MouseEvent) {
        machineService.send("save")
    }

    const closeBtn = document.getElementById("btn-close") as HTMLButtonElement
    closeBtn.onclick = function(ev:MouseEvent) {
        machineService.send("closeEditor")
    }

    const editorTextArea = document.getElementById("editor").getElementsByTagName("textarea").item(0) as HTMLTextAreaElement
    editorTextArea.onchange = function(ev:Event) {
        machineService.send("contentChanged")
    }
    editorTextArea.oninput = function(ev:Event) {
        machineService.send("contentChanged")
    }
})() 
