import './main.scss';
import { default as showdown } from 'showdown'
import { assign, createMachine, interpret, raise } from "xstate";

interface StateFromGoogle {
    action: StateFromGoogleAction
    fileId: string
    userId: string
}

enum StateFromGoogleAction {
    New,
    Open
}

interface Context {
    converter: showdown.Converter,
    tokenClient?: google.accounts.oauth2.TokenClient,
    state?: StateFromGoogle
}

type Events = {type: 'edit'}   
| {type: 'saved'}
| {type: 'save'} 
| {type: 'close'} 
| {type: 'toggle preview'}
| {type: 'scripts loaded'} 
| {type: 'google state processed'}
| {type: 'google state invalid'}
| {type: 'file loaded'}
| {type: 'process google state'}
| {type: 'on error'}

(function() {

    const CLIENT_ID = "413355556847-pd76u4ckm8d8jisjg2fmlamgisejh4nn.apps.googleusercontent.com";
    const API_KEY = "AIzaSyCQLy4XRrT2HWbALEcxhSf2rWNoeQvT6bA";
    const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
    const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install";

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

    function logInvokeFail(context:any, event:any) {
      console.log(event.data)
    }

    const handleFile = createMachine({
        "predictableActionArguments": true,
        "id": "handleFile",
        "context": {
            action: StateFromGoogleAction.New,
            fileId: "",
            userId: ""
        },
        "states": {
            "Loading file": {
            },
            "Viewing": {
            },
            "Editing": {
            },
            "Saving": {
            }
        },
        schema: {
            context: {} as {
                action: StateFromGoogleAction,
                fileId: string,
                userId: string
            }
        }
    })

    const machine = createMachine({
        "predictableActionArguments": true,
        "id": "Grive editor",
        "initial": "Initialize google",
        "context": {
          converter: new showdown.Converter()
        },
        "states": {
            "Initialize google": {
                "invoke": {
                    "src": (context, event) => Promise.all([loadGapi(), loadGis()]).then(initializeGapiClient),
                    "onDone": "Google state processing"
                },
            },
            "Authorizing": {
            },
            "Handling file": {
                invoke: {
                    src: handleFile,
                }
            },
            "App info": {},
            "Google state processing": {
                "invoke": {
                    "src": "parseStateTransition"
                },
                "on": {
                    "google state processed": [
                        {
                        "target": "Loading file",
                        //   "cond": "areFileDetailsPresent"
                        // },
                        // {
                        //   "target": "Editing",
                        //   "cond": "isNewFile"
                        // },
                        // {
                        //   "target": "App info"
                        }
                    ],
                    "google state invalid": {
                        "target": "Error view"
                    }
                }
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
        services: {
          parseStateTransition: (context, event) => (callback, onReceive) => {
            const searchParams = new URLSearchParams(window.location.search)
            
            // https://developers.google.com/drive/api/guides/integrate-open
            const state = JSON.parse(searchParams.get("state"));
            if(state == null) callback("google state invalid")
      
            const fileIds = state["ids"] as Array<string>;
            // if(fileIds.length != 1) throw Error("Invalid state parameter: to many file ids");
            if(fileIds.length != 1) callback("google state invalid")
      
            let action = StateFromGoogleAction.Unsupported
            if(state["action"] == "open") action = StateFromGoogleAction.Open
            if(state["action"] == "new") action = StateFromGoogleAction.New
      
            const userId = state["userId"]
      
            context.state = {
                fileId: fileIds[0],
                action: action,
                userId: userId
            }
            callback("google state processed")
          }
        },
        guards: {

        }
      }
    )
    interpret(machine)
      .onTransition((state) => { console.log(state.value) })
      .start()

    async function loadFile(state:StateFromGoogle) {
        // https://developers.google.com/drive/api/v3/reference/files
        const response = await gapi.client.drive.files.get({
            fileId: state.fileId,
            alt: "media"
        })

        const editor = document.getElementById("editor")
        const textArea = editor.getElementsByTagName("textarea").item(0) as HTMLTextAreaElement
        textArea.value = response.body

        const viewer = document.getElementById("viewer")
        // const html = converter.makeHtml(response.body);
        // viewer.innerHTML = html;
    }

    async function save(state:StateFromGoogle) {
        const editorEle = document.getElementById("editor") as HTMLDivElement
        const textArea = editorEle.getElementsByTagName("textarea").item(0) as HTMLTextAreaElement
        
        // according to https://stackoverflow.com/questions/40600725/google-drive-api-v3-javascript-update-file-contents
        // google drive javascript library doesn't support body upload
        await gapi.client.request({
            path: "/upload/drive/v3/files/" + state.fileId,
            method: "PATCH",
            params: {
                uploadType: "media"
            },
            body: textArea.value
        })

        editorEle.classList.toggle("d-none")

        const editBtn = document.getElementById("btn-edit")
        editBtn.classList.toggle("d-none")

        const saveBtn = document.getElementById("btn-save")
        saveBtn.classList.toggle("d-none")

        const previewBtn = document.getElementById("btn-preview")
        previewBtn.classList.toggle("d-none")
    }

    // function authorize() {
    //     tokenClient = google.accounts.oauth2.initTokenClient({
    //         client_id: CLIENT_ID,
    //         scope: SCOPES,
    //         callback: async (tokenResponse:google.accounts.oauth2.TokenResponse) => {
    //             if (tokenResponse.error !== undefined) {
    //               throw (tokenResponse);
    //             }

    //             if(state != null && state.action == StateFromGoogleAction.Open) {
    //                 loadFile(state)
    //             } else {
    //                 // should open editor with new file
    //                 throw new Error("Unsupported yet")
    //             }
    //         }
    //     });
        
    //     if(state == null) {
    //         tokenClient.requestAccessToken({
    //             prompt: 'consent',
    //         });
    //     } else {
    //         tokenClient.requestAccessToken({
    //             prompt: '',
    //             hint: state.userId
    //         });
    //     }
    // }

    // function maybeAuthorize() {
    //     if(gapiInited && gisInited) {
    //         authorize()
    //     }
    // }

    function onClickEditBtn(ev:MouseEvent) {
        const editorEle = document.getElementById("editor") as HTMLDivElement
        editorEle.classList.toggle("d-none")

        const editBtn = document.getElementById("btn-edit")
        editBtn.classList.toggle("d-none")

        const saveBtn = document.getElementById("btn-save")
        saveBtn.classList.toggle("d-none")

        const previewBtn = document.getElementById("btn-preview")
        previewBtn.classList.toggle("d-none")
    }

    function onClickPreviewBtn(ev:MouseEvent) {
        const viewerEle = document.getElementById("viewer") as HTMLDivElement
        viewerEle.classList.toggle("d-none")
    }

    function onClickSaveBtn(ev:MouseEvent) {
        // if(state != null) {
        //     save(state)
        // }
    }

    // const apiEle = document.createElement('script') as HTMLScriptElement
    // apiEle.defer = true
    // apiEle.src = "https://apis.google.com/js/api.js"
    // apiEle.addEventListener("load", apiLibraryLoaded)
    // document.body.appendChild(apiEle)

    // const gisEle = document.createElement('script') as HTMLScriptElement
    // gisEle.defer = true
    // gisEle.src = "https://accounts.google.com/gsi/client"
    // gisEle.addEventListener("load", gisLibaryLoaded)
    // document.body.appendChild(gisEle)

    const editBtn = document.getElementById("btn-edit") as HTMLButtonElement
    editBtn.onclick = onClickEditBtn

    const previewBtn = document.getElementById("btn-preview") as HTMLButtonElement
    previewBtn.onclick = onClickPreviewBtn

    const saveBtn = document.getElementById("btn-save") as HTMLButtonElement
    saveBtn.onclick = onClickSaveBtn
})()
