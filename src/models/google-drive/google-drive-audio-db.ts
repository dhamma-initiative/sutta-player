import { CACHEABLERESPONSEPLUGIN, CACHEFIRST, CacheUtils, REGISTERROUTE, RegisterRoutePayloadJson } from '../../runtime/cache-utils.js'
import { AudioStorageQueryable } from '../audio-storage-queryable.js'

import googleDriveAudioDB from './google-drive-audio-db.json' assert { type: 'json' }

export async function createAudioQueryable(): Promise<AudioStorageQueryable> {
    const ret = new GoogleDriveAudioDB()
    await ret.setup() 
    return ret
}

export class GoogleDriveAudioDB implements AudioStorageQueryable {
    public static CACHE_NAME = 'docs.google.com'
    public static ORIGIN = `https://${GoogleDriveAudioDB.CACHE_NAME}`
    public static REST_API = '/uc?export=open&id='

    public async setup() {
        if (!CacheUtils.ENABLE_CACHE)
            return
        const payload: RegisterRoutePayloadJson = {
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
        }        
        await CacheUtils.postMessage({
            type: REGISTERROUTE,
            payload: payload
        })        
    }

    public async isInCache(trackRef: string): Promise<boolean> {
        const cacheKey = this.queryHtmlAudioSrcRef(trackRef)
        const ret = await CacheUtils.isInCache(GoogleDriveAudioDB.CACHE_NAME, [cacheKey],
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

    public async removeFromCache(trackRef: string): Promise<boolean> {
        const cacheKey = this.queryHtmlAudioSrcRef(trackRef)
        const ret = await CacheUtils.deleteCachedUrls(GoogleDriveAudioDB.CACHE_NAME, [cacheKey])
        return ret[0]
    }

    public queryHtmlAudioSrcRef(trackRef: string): string {
        const shareId = googleDriveAudioDB[trackRef as keyof typeof googleDriveAudioDB]
        const ret = `${GoogleDriveAudioDB.ORIGIN}${GoogleDriveAudioDB.REST_API}${shareId}`
        return ret;
    }
}