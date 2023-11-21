import * as googleApi from "../google"

class GoolgeFile {
    constructor(
        public fileId : string,
    ) {}
}

let googleFile:GoolgeFile | null = null;

export type FileDetails = Omit<googleApi.FileDetails, "id">

export async function loadFile(fileId:string, userId:string):Promise<FileDetails> {
    await googleApi.authorizeFileAccess(userId)
    const result = await googleApi.loadFile(fileId);
    googleFile = new GoolgeFile(fileId)
    console.log("Loaded file", result)
    return result;
}

export async function createFile(userId:string, parent:string):Promise<FileDetails> {
    await googleApi.authorizeFileAccess(userId)
    const result = await googleApi.createFile("Newfile.md", "", parent)
    googleFile = new GoolgeFile(result.id);
    return result
}

export async function save(newContent:string) {
    if(googleFile == null) {
        throw new Error("Google file not loaded");
    } else {
        googleApi.save(googleFile.fileId, newContent)
    }
}

export async function updateFileName(newName:string) {
    if(googleFile == null) {
        throw new Error("Google file not loaded");
    } else {
        googleApi.updateFileName(googleFile.fileId, newName)
    }
}

