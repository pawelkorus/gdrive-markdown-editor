const CLIENT_ID = "413355556847-pd76u4ckm8d8jisjg2fmlamgisejh4nn.apps.googleusercontent.com";
const API_KEY = "AIzaSyCQLy4XRrT2HWbALEcxhSf2rWNoeQvT6bA";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
const SCOPE_FILE_ACCESS = "https://www.googleapis.com/auth/drive.file";
const SCOPE_INSTALL = "https://www.googleapis.com/auth/drive.install";

type RequestTokenSuccess = (tokenReponse:google.accounts.oauth2.TokenResponse) => void
type RequestTokenReject = (error:unknown) => void

class TokenCallbackResult {

    private r:RequestTokenSuccess
    private e:RequestTokenReject
    
    constructor(r:RequestTokenSuccess, e:RequestTokenReject) {
        this.r = r;
        this.e = e;
    }

    public resolve(tokenReponse:google.accounts.oauth2.TokenResponse) {
        this.r(tokenReponse)
    }

    public reject(error:unknown) {
        this.e(error)
    }
}

let waitForTokenResult:TokenCallbackResult
let tokenClientPromise:any = null

function initializeTokenClient():Promise<google.accounts.oauth2.TokenClient> {
    tokenClientPromise = Promise.resolve(google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE_INSTALL,
        callback: async (tokenResponse:google.accounts.oauth2.TokenResponse) => {
            if(!waitForTokenResult) return
            
            if (tokenResponse.error !== undefined) {
                waitForTokenResult.reject(tokenResponse.error)
            }

            waitForTokenResult.resolve(tokenResponse)
        }
    }))

    return tokenClientPromise;
}

export async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    })
}

export function loadGapi() {
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

export function loadGis() {
    return new Promise((resolve, reject) => {
        const gisEle = document.createElement('script') as HTMLScriptElement
        gisEle.defer = true
        gisEle.src = "https://accounts.google.com/gsi/client"
        gisEle.addEventListener("load", () => { 
            initializeTokenClient().then(() => resolve(true)) 
        })
        document.body.appendChild(gisEle)
    })
}

export async function authorizeFileAccess(userId: string) {
    return new Promise(async (resolve, reject) => {
        waitForTokenResult = new TokenCallbackResult(resolve, reject);

        let tokenClient = await tokenClientPromise;
        tokenClient.requestAccessToken({
            scope: SCOPE_FILE_ACCESS,
            hint: userId
        });
    })
}

export async function authorizeInstall() {
    return new Promise(async (resolve, reject) => {
        waitForTokenResult = new TokenCallbackResult(resolve, reject);

        let tokenClient = await tokenClientPromise;
        tokenClient.requestAccessToken({
            scope: SCOPE_INSTALL
        });
    })
}


export async function loadFile(fileId:string):Promise<string> {
    // https://developers.google.com/drive/api/v3/reference/files
    const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: "media"
    })
    return response.body
}

export async function createFile(filename: string, content:string, parent:string):Promise<string> {
    const response = await gapi.client.drive.files.create({
        uploadType: "media"
    }, {
        name: filename + ".md",
        // mimeType: "text/markdown",
        parents: [
            parent
        ],
    })

    return response.result.id
}

export async function save(fileId:string, content:string) {
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

export interface StateFromGoogle {
    action: StateFromGoogleAction
    fileId: string
    userId: string
    folderId: string|undefined,
    folderResourceKey: string|undefined
}

export enum StateFromGoogleAction {
    New,
    Open,
    Install,
    Unsupported
}

export function parseGoogleState():StateFromGoogle {
    const searchParams = new URLSearchParams(window.location.search)

    // https://developers.google.com/drive/api/guides/integrate-open
    const state = JSON.parse(searchParams.get("state"));
    if(state == null) {
        return {
            action: StateFromGoogleAction.Install,
            fileId: "",
            userId: "",
            folderId: undefined,
            folderResourceKey: undefined
        }
    }


    let action = StateFromGoogleAction.Unsupported
    if(state["action"] == "open") action = StateFromGoogleAction.Open
    if(state["action"] == "new") action = StateFromGoogleAction.New
    if(state["action"] == "create") action = StateFromGoogleAction.New

    const userId = state["userId"]

    switch(action) {
        case StateFromGoogleAction.Open: {
            const fileIds = state["ids"] as Array<string>;
            if(action == StateFromGoogleAction.Open && fileIds.length != 1) throw Error("Invalid state parameter: to many file ids");
            
            return {
                action: action,
                fileId: fileIds? fileIds[0] : undefined,
                userId: userId,
                folderId: undefined,
                folderResourceKey: undefined
            }
        }
        case StateFromGoogleAction.New: {
            const folderId = state["folderId"] as string
            if(!folderId) throw Error("Can't create new file. Destination folder not specified")
            
            const folderResourceKey = state["folderResourceKey"] as string

            return {
                action: action,
                fileId: undefined,
                userId: userId,
                folderId: folderId,
                folderResourceKey: folderResourceKey
            }
        }
        default: {
            return {
                action: action,
                fileId: undefined,
                userId: userId,
                folderId: undefined,
                folderResourceKey: undefined
            }
        }
    }
}
