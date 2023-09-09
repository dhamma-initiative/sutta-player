import { CACHEABLERESPONSEPLUGIN, CACHEFIRST, CacheUtils, REGISTERROUTE } from '../../runtime/cache-utils.js';
import googleDriveAudioDB from './google-drive-audio-db.json' assert { type: 'json' };
export async function createAudioQueryable() {
    const ret = new GoogleDriveAudioDB();
    await ret.setup();
    return ret;
}
export class GoogleDriveAudioDB {
    static CACHE_NAME = 'docs.google.com';
    static ORIGIN = `https://${GoogleDriveAudioDB.CACHE_NAME}`;
    static REST_API = '/uc?export=open&id=';
    async setup() {
        if (!CacheUtils.ENABLE_CACHE)
            return;
        const payload = {
            url_origin: GoogleDriveAudioDB.ORIGIN,
            strategy: {
                class_name: CACHEFIRST,
                cacheName: GoogleDriveAudioDB.CACHE_NAME,
                plugins: [
                    {
                        class_name: CACHEABLERESPONSEPLUGIN,
                        options: {
                            statuses: [0, 200]
                        }
                    }
                ]
            }
        };
        await CacheUtils.postMessage({
            type: REGISTERROUTE,
            payload: payload
        });
    }
    async isInCache(trackRef) {
        const cacheKey = this.queryHtmlAudioSrcRef(trackRef);
        const ret = await CacheUtils.isInCache(GoogleDriveAudioDB.CACHE_NAME, [cacheKey], (resp) => {
            let acceptRes = resp?.ok ? true : false;
            if (!acceptRes) {
                if (resp?.status === 0 && resp?.type === 'opaque')
                    acceptRes = true;
            }
            return acceptRes;
        });
        return ret[0];
    }
    async removeFromCache(trackRef) {
        const cacheKey = this.queryHtmlAudioSrcRef(trackRef);
        const ret = await CacheUtils.deleteCachedUrls(GoogleDriveAudioDB.CACHE_NAME, [cacheKey]);
        return ret[0];
    }
    queryHtmlAudioSrcRef(trackRef) {
        const shareId = googleDriveAudioDB[trackRef];
        const ret = `${GoogleDriveAudioDB.ORIGIN}${GoogleDriveAudioDB.REST_API}${shareId}`;
        return ret;
    }
}
//# sourceMappingURL=google-drive-audio-db.js.map