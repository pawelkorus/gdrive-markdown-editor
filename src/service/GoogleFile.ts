import * as googleApi from "../google"

class GoolgeFile {
    constructor(
        public fileId : string,
    ) {}
}

var googleFile:GoolgeFile | null = null;

export async function loadFile(fileId:string, userId:string) {
    await googleApi.authorizeFileAccess(userId)
    var content = await googleApi.loadFile(fileId);
    googleFile = new GoolgeFile(fileId)
    return content;
}

export async function createFile(userId:string, parent:string) {
    await googleApi.authorizeFileAccess(userId)
    const fileId = await googleApi.createFile("Newfile.md", "", parent)
    googleFile = new GoolgeFile(fileId);
    return "This is new file"
}

export async function save(newContent:string) {
    if(googleFile == null) {
        throw new Error("Google file not loaded");
    } else {
        googleApi.save(googleFile.fileId, newContent)
    }
}

