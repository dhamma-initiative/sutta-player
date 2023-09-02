import { CacheUtils } from '../../runtime/cache-utils.js'
import { AudioStorageQueryable } from '../audio-storage-queryable.js'
import googleDriveAudioDB from './google-drive-audio-db.json' assert { type: 'json' }


export function createAudioQueryable():AudioStorageQueryable {
    return new GoogleDriveAudioDB()
}

export class GoogleDriveAudioDB implements AudioStorageQueryable {
    public static CACHE_NAME = 'docs.google.com'
    public static ORIGIN = `https://${GoogleDriveAudioDB.CACHE_NAME}`
    public static REST_API = '/uc?export=open&id='

    public async isInCache(suttaRef: string): Promise<boolean> {
        const cacheKey = this.queryHtmlAudioSrcRef(suttaRef)
        const ret = await CacheUtils.isInCache(GoogleDriveAudioDB.CACHE_NAME, [cacheKey],
            (resp: Response) => {
                let ret = resp?.ok ? true : false 
                if (!ret) {
                    if (resp?.status === 0 && resp?.type === 'opaque')
                        ret = true
                }
                return ret
            }
        )
        return ret[0]
    }

    public async removeFromCache(suttaRef: string): Promise<boolean> {
        const cacheKey = this.queryHtmlAudioSrcRef(suttaRef)
        const ret = await CacheUtils.deleteCachedUrls(GoogleDriveAudioDB.CACHE_NAME, [cacheKey])
        return ret[0]
    }

    public queryHtmlAudioSrcRef(suttaRef: string): string {
        const shareId = googleDriveAudioDB[suttaRef as keyof typeof googleDriveAudioDB]
        const ret = `${GoogleDriveAudioDB.ORIGIN}${GoogleDriveAudioDB.REST_API}${shareId}`
        return ret;
    }
}