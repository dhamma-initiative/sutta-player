import { CacheUtils } from '../../runtime/cache-utils.js';
import googleDriveAudioDB from './google-drive-audio-db.json' assert { type: 'json' };
export function createAudioQueryable() {
    return new GoogleDriveAudioDB();
}
export class GoogleDriveAudioDB {
    static CACHE_NAME = 'docs.google.com';
    static ORIGIN = `https://${GoogleDriveAudioDB.CACHE_NAME}`;
    static REST_API = '/uc?export=open&id=';
    async isInCache(suttaRef) {
        const cacheKey = this.queryHtmlAudioSrcRef(suttaRef);
        const ret = await CacheUtils.isInCache(GoogleDriveAudioDB.CACHE_NAME, [cacheKey], (resp) => {
            let ret = resp?.ok ? true : false;
            if (!ret) {
                if (resp?.status === 0 && resp?.type === 'opaque')
                    ret = true;
            }
            return ret;
        });
        return ret[0];
    }
    async removeFromCache(suttaRef) {
        const cacheKey = this.queryHtmlAudioSrcRef(suttaRef);
        const ret = await CacheUtils.deleteCachedUrls(GoogleDriveAudioDB.CACHE_NAME, [cacheKey]);
        return ret[0];
    }
    queryHtmlAudioSrcRef(suttaRef) {
        const shareId = googleDriveAudioDB[suttaRef];
        const ret = `${GoogleDriveAudioDB.ORIGIN}${GoogleDriveAudioDB.REST_API}${shareId}`;
        return ret;
    }
}
//# sourceMappingURL=google-drive-audio-db.js.map