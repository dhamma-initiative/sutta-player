import { AudioStorageQueryable } from '../audio-storage-queryable.js'
import googleDriveAudioDB from './google-drive-audio-db.json' assert { type: 'json' }


export function createAudioQueryable():AudioStorageQueryable {
    return new GoogleDriveAudioDB()
}

export class GoogleDriveAudioDB implements AudioStorageQueryable {
    public queryHtmlAudioSrcRef(suttaRef: string): string {
        let shareId = googleDriveAudioDB[suttaRef as keyof typeof googleDriveAudioDB];
        const ret = `https://docs.google.com/uc?export=open&id=${shareId}`;
        return ret;
    }
}