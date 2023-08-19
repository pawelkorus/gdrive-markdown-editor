const CLIENT_ID = "413355556847-pd76u4ckm8d8jisjg2fmlamgisejh4nn.apps.googleusercontent.com";
const API_KEY = "AIzaSyCQLy4XRrT2HWbALEcxhSf2rWNoeQvT6bA";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
const SCOPE_FILE_ACCESS = "https://www.googleapis.com/auth/drive.file";
const SCOPE_INSTALL = "https://www.googleapis.com/auth/drive.install";

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
        gisEle.addEventListener("load", () => { resolve(true) })
        document.body.appendChild(gisEle)
    })
}

export async function authorizeFileAccess(userId: string) {
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

export async function authorizeInstall() {
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
