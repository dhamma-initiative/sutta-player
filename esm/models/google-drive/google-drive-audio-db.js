import googleDriveAudioDB from './google-drive-audio-db.json' assert { type: 'json' };
export function createAudioQueryable() {
    return new GoogleDriveAudioDB();
}
export class GoogleDriveAudioDB {
    queryHtmlAudioSrcRef(suttaRef) {
        let shareId = googleDriveAudioDB[suttaRef];
        const ret = `https://docs.google.com/uc?export=open&id=${shareId}`;
        return ret;
    }
}
//# sourceMappingURL=google-drive-audio-db.js.map