import './main.scss';
import { default as showdown } from 'showdown'
import { createMachine, interpret } from "xstate";

interface StateFromGoogle {
    action: StateFromGoogleAction
    fileId: string
    userId: string
}

enum StateFromGoogleAction {
    New,
    Open,
    Unsupported
}

(function() {

    function loadGapi() {
        return new Promise((resolve, reject) => {
            const apiEle = document.createElement('script') as HTMLScriptElement
            apiEle.defer = true
            apiEle.src = "https://apis.google.com/js/api.js"
            apiEle.addEventListener("load", () => resolve(true))
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

    const machine = createMachine({
        "id": "Grive editor",
        "initial": "Loading scripts",
        "states": {
          "Loading scripts": {
            "type": "parallel",
            "states": {
                "Load gapi": {
                    "invoke": {
                        "id": "getGapi",
                        "src": (context:any, event:any) => { return loadGapi() }
                    }
                },
                "Load gis": {
                    "invoke": {
                        "src": (context:any, event:any) => { return loadGis() }
                    }
                }
            },
            "onDone": "Authenticating"
          },
          "Viewing": {
            "on": {
              "edit": {
                "target": "Editing"
              }
            }
          },
          "Editing": {
            "on": {
              "save": {
                "target": "Saving"
              },
              "close": {
                "target": "Viewing"
              },
              "toggle preview": {}
            }
          },
          "Saving": {
            "on": {
              "saved": {
                "target": "Editing"
              },
              "on error": {
                "target": "Editing"
              }
            }
          },
          "Authenticating": {
            "on": {
              "process google state": {
                "target": "Google state processing"
              }
            }
          },
          "Loading file": {
            "on": {
              "file loaded": {
                "target": "Viewing"
              },
              "on error": {
                "target": "Error view"
              }
            }
          },
          "App info": {},
          "Google state processing": {
            "on": {
              "google state processed": [
                {
                  "target": "Loading file",
                  "cond": "areFileDetailsPresent"
                },
                {
                  "target": "Editing",
                  "cond": "isNewFile"
                },
                {
                  "target": "App info"
                }
              ]
            }
          },
          "Error view": {
            "type": "final"
          }
        },
        "schema": {
            events: {} as 
            {type: 'edit'} |   
            {type: 'saved'} | 
            {type: 'save'} | 
            {type: 'close'} | 
            {type: 'toggle preview'} | 
            {type: 'scripts loaded'} | 
            {type: 'google state processed'} | 
            {type: 'file loaded'} | 
            {type: 'process google state'} | 
            {type: 'on error'}
        }
      },
      {
        "actions": {
    
        },
      }
    )
    interpret(machine)
      .onTransition((state) => { console.log(state.value) })
      .start()

    const converter = new showdown.Converter()
    
    const CLIENT_ID = "413355556847-pd76u4ckm8d8jisjg2fmlamgisejh4nn.apps.googleusercontent.com";
    const API_KEY = "AIzaSyCQLy4XRrT2HWbALEcxhSf2rWNoeQvT6bA";
    const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
    const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install";
    const searchParams = new URLSearchParams(window.location.search)
    const state = parseState()
    let tokenClient:google.accounts.oauth2.TokenClient = null
    let gapiInited = false;
    let gisInited = false;

    function parseState():StateFromGoogle|null {
        // https://developers.google.com/drive/api/guides/integrate-open
        const state = JSON.parse(searchParams.get("state"));
        if(state == null) return null

        const fileIds = state["ids"] as Array<string>;
        if(fileIds.length != 1) throw Error("Invalid state parameter: to many file ids");

        let action = StateFromGoogleAction.Unsupported
        if(state["action"] == "open") action = StateFromGoogleAction.Open
        if(state["action"] == "new") action = StateFromGoogleAction.New

        const userId = state["userId"]

        return {
            fileId: fileIds[0],
            action: action,
            userId: userId
        }
    }

    function gisLibaryLoaded() {
        gisInited = true
    }

    function apiLibraryLoaded() {
        gapi.load('client', initializeGapiClient);
    }

    async function initializeGapiClient() {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeAuthorize();
    }

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
        const html = converter.makeHtml(response.body);
        viewer.innerHTML = html;
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

    function authorize() {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: async (tokenResponse:google.accounts.oauth2.TokenResponse) => {
                if (tokenResponse.error !== undefined) {
                  throw (tokenResponse);
                }

                if(state != null && state.action == StateFromGoogleAction.Open) {
                    loadFile(state)
                } else {
                    // should open editor with new file
                    throw new Error("Unsupported yet")
                }
            }
        });
        
        if(state == null) {
            tokenClient.requestAccessToken({
                prompt: 'consent',
            });
        } else {
            tokenClient.requestAccessToken({
                prompt: '',
                hint: state.userId
            });
        }
    }

    function maybeAuthorize() {
        if(gapiInited && gisInited) {
            authorize()
        }
    }

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
        if(state != null) {
            save(state)
        }
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