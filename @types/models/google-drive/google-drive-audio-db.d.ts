import { AudioStorageQueryable } from '../audio-storage-queryable.js';
export declare function createAudioQueryable(): AudioStorageQueryable;
export declare class GoogleDriveAudioDB implements AudioStorageQueryable {
    queryHtmlAudioSrcRef(suttaRef: string): string;
}
