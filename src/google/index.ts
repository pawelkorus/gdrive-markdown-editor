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

let waitForTokenResult:TokenCallbackResult;
let latestTokenResponse:google.accounts.oauth2.TokenResponse = null;
let tokenClient:google.accounts.oauth2.TokenClient = null;

function initializeTokenClient() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE_INSTALL,
        callback: async (tokenResponse:google.accounts.oauth2.TokenResponse) => {
            latestTokenResponse = tokenResponse
            
            if(!waitForTokenResult) return
            
            if (tokenResponse.error !== undefined) {
                waitForTokenResult.reject(tokenResponse.error)
            }

            waitForTokenResult.resolve(tokenResponse)
        }
    });
}

export type FileDetails = {
    id: string,
    name: string,
    content: string
}

export async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    })
}

export function loadGapi() {
    return new Promise((resolve) => {
        const apiEle = document.createElement('script') as HTMLScriptElement
        apiEle.defer = true
        apiEle.src = "https://apis.google.com/js/api.js"
        apiEle.addEventListener("load", () => {
            Promise.all(
                [loadGapiClient(), loadPicker()]
            )
            .then(() => resolve(true))
        })
        document.body.appendChild(apiEle)
    })
}

function loadGapiClient():Promise<boolean> {
    return new Promise((resolve, reject) => {
        gapi.load('client', {
            callback: () => resolve(true),
            onerror: (err: unknown) => reject("Failed to load gapi client. " + err),
            timeout: 15000,
            ontimeout: () => reject("Timeout when loading gapi client")
        })
    })
}

function loadPicker():Promise<boolean> {
    return new Promise((resolve, reject) => {
        gapi.load('picker', {
            callback: () => resolve(true),
            onerror: (err: unknown) => reject("Failed to load picker. " + err),
            timeout: 15000,
            ontimeout: () => reject("Timeout when loading picker")
        });
    });
}

export function showPicker():Promise<string> {
    return new Promise((resolve, reject) => {
        const view = new google.picker.DocsView(google.picker.ViewId.DOCS).setIncludeFolders(true);
        const uploadView = new google.picker.DocsUploadView().setIncludeFolders(true);

        const picker = new google.picker.PickerBuilder()
            .enableFeature(google.picker.Feature.SIMPLE_UPLOAD_ENABLED)
            .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
            .addView(view)
            .addView(uploadView)
            .setOAuthToken(latestTokenResponse.access_token)
            .setAppId(CLIENT_ID)
            .setDeveloperKey(API_KEY)
            .setCallback((res:google.picker.ResponseObject) => {
                if (res[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
                    const doc = res[google.picker.Response.DOCUMENTS][0];
                    const fileId = doc[google.picker.Document.ID]
                    resolve(fileId)
                } else if(res[google.picker.Response.ACTION] == google.picker.Action.CANCEL) {
                    reject("no pick")
                }
            })
            .build();
        picker.setVisible(true);
    });
}

export function showMarkdownPicker():Promise<string> {
    return new Promise((resolve, reject) => {
        const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
            .setIncludeFolders(true)
        
        const picker = new google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(latestTokenResponse.access_token)
            .setDeveloperKey(API_KEY)
            .setAppId(CLIENT_ID)
            .setCallback((res:google.picker.ResponseObject) => {
                if (res[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
                    const doc = res[google.picker.Response.DOCUMENTS][0];
                    const fileId = doc[google.picker.Document.ID]
                    resolve(fileId)
                } else if(res[google.picker.Response.ACTION] == google.picker.Action.CANCEL) {
                    reject("no pick")
                }
            })
            .build();
        picker.setVisible(true);
    });
}

export function loadGis() {
    return new Promise((resolve) => {
        const gisEle = document.createElement('script') as HTMLScriptElement
        gisEle.defer = true
        gisEle.src = "https://accounts.google.com/gsi/client"
        gisEle.addEventListener("load", () => { 
            initializeTokenClient()
            resolve(true)
        })
        document.body.appendChild(gisEle)
    })
}

export async function authorizeFileAccess(userId?: string) {
    return new Promise((resolve, reject) => {
        waitForTokenResult = new TokenCallbackResult(resolve, reject);

        tokenClient.requestAccessToken({
            scope: SCOPE_FILE_ACCESS + " https://www.googleapis.com/auth/drive.readonly",
            hint: userId,
            include_granted_scopes: true
        });
    })
}

export async function authorizeInstall() {
    return new Promise((resolve, reject) => {
        waitForTokenResult = new TokenCallbackResult(resolve, reject);

        tokenClient.requestAccessToken({
            scope: SCOPE_INSTALL
        });
    })
}

export async function loadFile(fileId:string):Promise<FileDetails> {
    // https://developers.google.com/drive/api/v3/reference/files
    const results = await Promise.all([
        gapi.client.drive.files.get({
            fileId: fileId,
            fields: "id,name"
        }),
        gapi.client.drive.files.get({
            fileId: fileId,
            alt: "media"
        })
    ]);

    const metadataResponse = results[0] 
    const response = results[1]
    
    return {
        id: fileId,
        name: metadataResponse.result.name,
        content: response.body
    }
}

export async function loadBinaryFile(fileId:string):Promise<string> {
    // https://developers.google.com/drive/api/v3/reference/files
    const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: "media"
    })
    return btoa(response.body) 
}

export async function createFile(filename: string, content:string, parent:string):Promise<FileDetails> {
    const response = await gapi.client.drive.files.create({
        uploadType: "media"
    }, {
        name: filename + ".md",
        mimeType: "text/markdown",
        parents: [
            parent
        ],
    })

    return {
        id: response.result.id,
        name: response.result.name,
        content: content
    }
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

// generate method that will update gdrive file name
export async function updateFileName(fileId:string, filename:string) {
    await gapi.client.request({
        path: "/drive/v3/files/" + fileId,
        method: "PATCH",
        body: {
            name: filename
        }
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
