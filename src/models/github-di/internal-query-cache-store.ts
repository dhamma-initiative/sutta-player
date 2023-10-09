import { CacheUtils } from "../../runtime/cache-utils.js"
import { TrackSelection } from "../album-player-state.js"
import { CacheService, QueryService } from "../album-storage-queryable.js"
import { CACHE_NAME, UrlUtils } from "./bg-tracks-commons.js"

import albumIndexDb from './track-storage/0-album-index-db.json' assert { type: 'json' }

interface AlbumIndexDbJson {
    albumName: string[]
    albumBaseDirectory: string[]
}

export class InternalQueryCacheStore implements QueryService, CacheService {
    protected _albumIndexDbJson: AlbumIndexDbJson = albumIndexDb
    protected _lastTrackReferencesRqstKey: string = null
    protected _lastTrackReferencesRqstVal: string[] = null
    protected _lastTrackReferencesRqstTimeoutHandle: ReturnType<typeof setTimeout>

    public queryAlbumNames(): string[] {
        return Array.from(this._albumIndexDbJson.albumName)
    }

    public queryAlbumReferences(): string[] {
        return Array.from(this._albumIndexDbJson.albumBaseDirectory)
    }

    public async queryTrackReferences(albIdx: number): Promise<string[]> {
        albIdx = albIdx === -1 ? 0 : albIdx
        const albumRef = this._albumIndexDbJson.albumBaseDirectory[albIdx]
        return await this._queryTrackReferences(albumRef)
    }

    public async queryTrackBaseRef(albIdx: number, trackIdx: number): Promise<string> {
        if (albIdx === -1 || trackIdx === -1)
            return null
        const albumRef = this._albumIndexDbJson.albumBaseDirectory[albIdx]
        const tracks = await this._queryTrackReferences(albumRef)
        const trackName = tracks[trackIdx]
        const ret = `${albumRef}/${trackName}`
        return ret
    }

    public async queryTrackSelection(baseRef: string): Promise<TrackSelection> {
        const trackName = baseRef.replace(/^.*[\\\/]/, '')
        let albumRef = baseRef.substring(0, baseRef.length - trackName.length)
        if (albumRef.startsWith('/'))
            albumRef = albumRef.substring(1)
        if (albumRef.endsWith('/'))
            albumRef = albumRef.substring(0, albumRef.length-1)
        const albIdx = this._albumIndexDbJson.albumBaseDirectory.indexOf(albumRef)
        const trackNames = await this._queryTrackReferences(albumRef)
        const trkIdx = trackNames.indexOf(trackName)
        const ret = new TrackSelection('url', albIdx, trkIdx, baseRef)
        return ret
    }

    public async queryTrackText(baseRef: string): Promise<string> {
        let ret: string = null
        const url = this.queryTrackTextUrl(baseRef)
        const isInCacheChk = await this.isInCache(baseRef, true, false)
        if (isInCacheChk[0]) {
            const resp = await CacheUtils.getFromCache(CACHE_NAME, [url])
            ret = await resp[0].text()
        } else
            ret = await this.readTextFile(url)
        return ret
    }

    public queryTrackTextUrl(baseRef: string): string {
        return UrlUtils.queryTrackTextUrl(baseRef)
    }

    public queryTrackHtmlAudioSrcRef(baseRef: string): string {
        return UrlUtils.queryTrackHtmlAudioSrcRef(baseRef)
    }

    public async readTextFile(url: string): Promise<string> {
        try {
            const resp = await fetch(url)
            const text = await resp.text()
            return text
        } catch (e) {
            return 'Network error was error encountered!\nPlease check connection and reload app.'
        }
    }

    public async isInCache(baseRef: string, txt: boolean, aud: boolean): Promise<boolean[]> {
        const src: string[] = this._prepareBaseRefAsUrls(baseRef, txt, aud)
        const ret = await CacheUtils.isInCache(CACHE_NAME, src,
            (resp: Response, url: string) => {
                let ret =  (resp?.type === 'opaque' && resp?.url === '')
                return ret
                // return resp?.ok ? true : false 
            }
        )
        return ret
    }

    public async addToCache(baseRef: string, txt: boolean, aud: boolean): Promise<boolean[]> {
        const urls: string[] = this._prepareBaseRefAsUrls(baseRef, txt, aud)
        const ret = await CacheUtils.addCachedUrls(CACHE_NAME, urls)
        return ret
    }

    public async removeFromCache(baseRef: string, txt: boolean, aud: boolean): Promise<boolean[]> {
        const src: string[] = this._prepareBaseRefAsUrls(baseRef, txt, aud)
        const ret = await CacheUtils.deleteCachedUrls(CACHE_NAME, src)
        return ret
    }

    protected _prepareBaseRefAsUrls(baseRef: string, txt: boolean, aud: boolean): string[] {
        const ret: string[] = [null, null]
        if (txt)
            ret[0] = this.queryTrackTextUrl(baseRef)
        if (aud)
            ret[1] = this.queryTrackHtmlAudioSrcRef(baseRef)
        return ret
    }

    protected async _queryTrackReferences(colRef: string): Promise<string[]> {
        if (this._lastTrackReferencesRqstKey === colRef && this._lastTrackReferencesRqstVal) {
            this._startInMemoryTrackReferencesClearanceTime()
            return this._lastTrackReferencesRqstVal
        }
        this._lastTrackReferencesRqstKey = colRef
        colRef = colRef.replaceAll('/', '_')
        const dbFile = `/esm/models/github-di/track-storage/${colRef}-db.json`
        const resp = await fetch(dbFile)
        const json = await resp.json()
        this._lastTrackReferencesRqstVal = json
        this._startInMemoryTrackReferencesClearanceTime()
        return json
    }

    protected _startInMemoryTrackReferencesClearanceTime() {
        clearTimeout(this._lastTrackReferencesRqstTimeoutHandle)
        this._lastTrackReferencesRqstTimeoutHandle = setTimeout(() => {
            this._lastTrackReferencesRqstKey = null
            this._lastTrackReferencesRqstVal = null
        }, 5000)
    }
}
