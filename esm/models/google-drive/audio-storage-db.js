import { CACHEABLERESPONSEPLUGIN, CACHEFIRST, CacheUtils, REGISTERROUTE } from '../../runtime/cache-utils.js';
import { DeferredPromise } from '../../runtime/deferred-promise.js';
import googleDriveAudioStorageDB from './audio-storage-db.json' assert { type: 'json' };
export async function createAudioQueryable() {
    const ret = new GoogleDriveAudioStorageDB();
    await ret.setup();
    return ret;
}
export class GoogleDriveAudioStorageDB {
    static CACHE_NAME = 'drive.google.com';
    static ORIGIN = `https://${GoogleDriveAudioStorageDB.CACHE_NAME}`;
    static REST_API = '/uc?export=download&id=';
    async setup() {
        if (!CacheUtils.ENABLE_CACHE)
            return;
        await this._registerRoutesWithServiceWorker();
    }
    async _registerRoutesWithServiceWorker() {
        const payload = {
            url_origin: GoogleDriveAudioStorageDB.ORIGIN,
            strategy: {
                class_name: CACHEFIRST,
                cacheName: GoogleDriveAudioStorageDB.CACHE_NAME,
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
    async isInCache(baseRef) {
        const cacheUrlKey = this.queryHtmlAudioSrcRef(baseRef);
        const ret = await CacheUtils.isInCache(GoogleDriveAudioStorageDB.CACHE_NAME, [cacheUrlKey], (resp) => {
            let acceptRes = resp?.ok ? true : false;
            if (!acceptRes) {
                if (resp?.status === 0 && resp?.type === 'opaque')
                    acceptRes = true;
            }
            return acceptRes;
        });
        return ret[0];
    }
    async addToCache(baseRef) {
        const url = this.queryHtmlAudioSrcRef(baseRef);
        const deferredAdded = new DeferredPromise();
        const audioDwnld = new Audio();
        audioDwnld.addEventListener('canplaythrough', () => {
            deferredAdded.resolve(true);
        });
        audioDwnld.src = url;
        const ret = await deferredAdded;
        return ret;
    }
    async removeFromCache(baseRef) {
        const cacheUrlKey = this.queryHtmlAudioSrcRef(baseRef);
        const ret = await CacheUtils.deleteCachedUrls(GoogleDriveAudioStorageDB.CACHE_NAME, [cacheUrlKey]);
        return ret[0];
    }
    queryHtmlAudioSrcRef(baseRef) {
        const shareId = googleDriveAudioStorageDB[baseRef];
        const ret = `${GoogleDriveAudioStorageDB.ORIGIN}${GoogleDriveAudioStorageDB.REST_API}${shareId}`;
        return ret;
    }
}
//# sourceMappingURL=audio-storage-db.js.map