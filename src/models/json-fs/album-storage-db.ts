import { CACHEABLERESPONSEPLUGIN, CACHEFIRST, CacheUtils, REGISTERROUTE, RegisterRoutePayloadJson } from '../../runtime/cache-utils.js'
import { TrackSelection } from '../album-player-state.js'
import { AlbumStorageQueryable } from '../album-storage-queryable.js'
import albumDb from './album-storage-db.json' assert { type: 'json' }

export async function createAlbumStorageQueryable(): Promise<AlbumStorageQueryable> {
    const ret = new JsonFsAlbumStorageDB()
    await ret.setup() 
    return ret
}

export class JsonFsAlbumStorageDB implements AlbumStorageQueryable {
    public static CACHE_NAME = 'txt-suttaplayer.self.com.au'

    public async setup() {
        if (!CacheUtils.ENABLE_CACHE)
            return
        const payload: RegisterRoutePayloadJson = {
            url_href_endsWith: '.txt',
            strategy: {
                class_name: CACHEFIRST,
                cacheName: JsonFsAlbumStorageDB.CACHE_NAME,
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

    public queryAlbumNames(): string[] {
        return albumDb.albumName
    }

    public queryAlbumReferences(): string[] {
        return albumDb.albumBaseDirectory
    }

    public queryTrackReferences(albIdx: number): string[] {
        albIdx = albIdx === -1 ? 0 : albIdx
        const key = albumDb.albumBaseDirectory[albIdx]
        return this._queryTrackReferences(key)
    }

    public queryTrackBaseRef(albIdx: number, trackIdx: number): string {
        if (albIdx === -1 || trackIdx === -1)
            return null
        const basePath = this.queryAlbumReferences()[albIdx]
        const baseName = this.queryTrackReferences(albIdx)[trackIdx]
        const ret = `${basePath}/${baseName}`
        return ret
    }

    public queryTrackSelection(baseRef: string): TrackSelection {
        const baseName = baseRef.replace(/^.*[\\\/]/, '')
        let basePath = baseRef.substring(0, baseRef.length - baseName.length)
        if (basePath.startsWith('/'))
            basePath = basePath.substring(1)
        if (basePath.endsWith('/'))
            basePath = basePath.substring(0, basePath.length-1)
        const albIdx = albumDb.albumBaseDirectory.indexOf(basePath)
        const lov = this._queryTrackReferences(basePath)
        const trkIdx = lov.indexOf(baseName)
        const ret = new TrackSelection('url', albIdx, trkIdx, baseRef)
        return ret
    }

    public async queryTrackText(baseRef: string): Promise<string> {
        const relPath = this.queryTrackTextUri(baseRef)
        const ret = await this.readTextFile(relPath)
        return ret
    }

    public queryTrackTextUri(baseRef: string): string {
        const relPath = `./text/suttas/${baseRef}.txt`
        return relPath
    }

    public async readTextFile(relPath: string): Promise<string> {
        const resp = await fetch(relPath)
        const text = await resp.text()
        return text
    }

    public async isInCache(baseRef: string): Promise<boolean> {
        const trackTxtUri = this.queryTrackTextUri(baseRef)
        const ret = await CacheUtils.isInCache(JsonFsAlbumStorageDB.CACHE_NAME, [trackTxtUri],
            (resp: Response) => {
                return resp?.ok ? true : false 
            }
        )
        return ret[0]
    }

    public async addToCache(baseRef: string): Promise<boolean> {
        const trackTxtUri = this.queryTrackTextUri(baseRef)
        const ret = await CacheUtils.addCachedUrls(JsonFsAlbumStorageDB.CACHE_NAME, [trackTxtUri])
        return ret[0]
    }

    public async removeFromCache(baseRef: string): Promise<boolean> {
        const trackTxtUri = this.queryTrackTextUri(baseRef)
        const ret = await CacheUtils.deleteCachedUrls(JsonFsAlbumStorageDB.CACHE_NAME, [trackTxtUri])
        return ret[0]
    }

    protected _queryTrackReferences(colRef: string): string[] {
        const trackRefs = albumDb[colRef as keyof typeof albumDb]
        return trackRefs
    }
}
