import { CACHEABLERESPONSEPLUGIN, CACHEFIRST, CacheUtils, REGISTERROUTE, RegisterRoutePayloadJson } from '../../runtime/cache-utils.js'
import { TrackSelection } from '../album-player-state.js'
import { AlbumStorageQueryable } from '../album-storage-queryable.js'
import { AudioStorageQueryable } from '../audio-storage-queryable.js'
import albumDb from './album-track-storage-db.json' assert { type: 'json' }

export async function createAlbumStorageQueryable(): Promise<AlbumStorageQueryable> {
    return GithubDiSuttaStorageDB.SINGLETON
}

export async function createAudioQueryable(): Promise<AudioStorageQueryable> {
    return GithubDiSuttaStorageDB.SINGLETON
}

export class GithubDiSuttaStorageDB implements AlbumStorageQueryable {
    public static SINGLETON: GithubDiSuttaStorageDB

    public static CACHE_NAME = 'dhamma-initiative.github.io'
    public static ORIGIN = `https://${GithubDiSuttaStorageDB.CACHE_NAME}`

    static {
        (async () => {
            GithubDiSuttaStorageDB.SINGLETON = new GithubDiSuttaStorageDB()
            await GithubDiSuttaStorageDB.SINGLETON.setup()
        })()
    } 


    public async setup() {
        if (!CacheUtils.ENABLE_CACHE)
            return
            const payload: RegisterRoutePayloadJson = {
                url_origin: GithubDiSuttaStorageDB.ORIGIN,
                strategy: {
                    class_name: CACHEFIRST,
                    cacheName: GithubDiSuttaStorageDB.CACHE_NAME,
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
        const relPath = `${GithubDiSuttaStorageDB.ORIGIN}/${baseRef}.txt`
        return relPath
    }

    public async readTextFile(relPath: string): Promise<string> {
        const resp = await fetch(relPath)
        const text = await resp.text()
        return text
    }

    public queryHtmlAudioSrcRef(baseRef: string): string {
        const relPath = `${GithubDiSuttaStorageDB.ORIGIN}/${baseRef}.wav.mp3`
        return relPath
    }

    public async isInCache(baseRef: string): Promise<boolean> {
        const trackTxtUri = this.queryTrackTextUri(baseRef)
        const ret = await CacheUtils.isInCache(GithubDiSuttaStorageDB.CACHE_NAME, [trackTxtUri],
            (resp: Response) => {
                return resp?.ok ? true : false 
            }
        )
        return ret[0]
    }

    public async addToCache(baseRef: string): Promise<boolean> {
        const trackTxtUri = this.queryTrackTextUri(baseRef)
        const ret = await CacheUtils.addCachedUrls(GithubDiSuttaStorageDB.CACHE_NAME, [trackTxtUri])
        return ret[0]
    }

    public async removeFromCache(baseRef: string): Promise<boolean> {
        const trackTxtUri = this.queryTrackTextUri(baseRef)
        const ret = await CacheUtils.deleteCachedUrls(GithubDiSuttaStorageDB.CACHE_NAME, [trackTxtUri])
        return ret[0]
    }

    protected _queryTrackReferences(colRef: string): string[] {
        const trackRefs = albumDb[colRef as keyof typeof albumDb]
        return trackRefs
    }
}
