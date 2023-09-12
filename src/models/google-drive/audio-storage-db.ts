import { CACHEABLERESPONSEPLUGIN, CACHEFIRST, CacheUtils, REGISTERROUTE, RegisterRoutePayloadJson } from '../../runtime/cache-utils.js'
import { DeferredPromise } from '../../runtime/deferred-promise.js'
import { AudioStorageQueryable } from '../audio-storage-queryable.js'

import googleDriveAudioStorageDB from './audio-storage-db.json' assert { type: 'json' }

export async function createAudioQueryable(): Promise<AudioStorageQueryable> {
    const ret = new GoogleDriveAudioStorageDB()
    await ret.setup() 
    return ret
}

export class GoogleDriveAudioStorageDB implements AudioStorageQueryable {
    public static CACHE_NAME = 'drive.google.com'
    public static ORIGIN = `https://${GoogleDriveAudioStorageDB.CACHE_NAME}`
    public static REST_API = '/uc?export=download&id='

    public async setup() {
        if (!CacheUtils.ENABLE_CACHE) 
            return
        await this._registerRoutesWithServiceWorker()        
    }

    private async _registerRoutesWithServiceWorker() {
        const payload: RegisterRoutePayloadJson = {
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
        }
        await CacheUtils.postMessage({
            type: REGISTERROUTE,
            payload: payload
        })
    }

    public async isInCache(baseRef: string): Promise<boolean> {
        const cacheUrlKey = this.queryHtmlAudioSrcRef(baseRef)
        const ret = await CacheUtils.isInCache(GoogleDriveAudioStorageDB.CACHE_NAME, [cacheUrlKey],
            (resp: Response) => {
                let acceptRes = resp?.ok ? true : false 
                if (!acceptRes) {
                    if (resp?.status === 0 && resp?.type === 'opaque')
                        acceptRes = true
                }
                return acceptRes
            }
        )
        return ret[0]
    }

    public async addToCache(baseRef: string): Promise<boolean> {
        const url = this.queryHtmlAudioSrcRef(baseRef)
        const deferredAdded = new DeferredPromise<boolean>()
        const audioDwnld = new Audio()
        audioDwnld.addEventListener('canplaythrough', () => {
            deferredAdded.resolve(true)
        })
        audioDwnld.src = url
        const ret = await deferredAdded 
        return ret
    }

    public async removeFromCache(baseRef: string): Promise<boolean> {
        const cacheUrlKey = this.queryHtmlAudioSrcRef(baseRef)
        const ret = await CacheUtils.deleteCachedUrls(GoogleDriveAudioStorageDB.CACHE_NAME, [cacheUrlKey])
        return ret[0]
    }

    public queryHtmlAudioSrcRef(baseRef: string): string {
        const shareId = googleDriveAudioStorageDB[baseRef as keyof typeof googleDriveAudioStorageDB]
        const ret = `${GoogleDriveAudioStorageDB.ORIGIN}${GoogleDriveAudioStorageDB.REST_API}${shareId}`
        return ret;
    }
}