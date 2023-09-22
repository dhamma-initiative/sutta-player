import { CACHEFIRST_TEXTANDDOWNLOADS, CacheUtils, REGISTERROUTE, RegisterRoutePayloadJson } from '../../runtime/cache-utils.js'
import { DeferredPromise } from '../../runtime/deferred-promise.js'
import { WorkerFactory, WorkerMessage } from '../../runtime/worker-utils.js'
import { TrackSelection } from '../album-player-state.js'
import { AlbumStorageQueryable, ProcessedItem } from '../album-storage-queryable.js'
import { AlbumTrackRqstMsg, CACHED_TRACKS_STATUS_FINISHED_RESP_MSG, CACHED_TRACKS_STATUS_RQST_MSG, CACHE_NAME, DOWNLOAD_TRACKS_RQST_MSG, ORIGIN, TrackProcessRespMsg, TrackProcessRqstMsg, TrackStatusRespMsg, UrlUtils } from './bg-tracks-commons.js'

import albumDb from './album-track-storage-db.json' assert { type: 'json' }

interface AlbumDbJson {
    albumName: string[]
    albumBaseDirectory: string[]
    AN: string[]
    DN: string[]
    "KN/Dhp": string[]
    "KN/Iti": string[]
    "KN/Khp": string[]
    "KN/StNp": string[]
    "KN/Thag": string[]
    "KN/Thig": string[]
    "KN/Ud": string[]
    MN: string[]
    SN: string[]
}

export async function createAlbumStorageQueryable(): Promise<AlbumStorageQueryable> {
    GithubDiSuttaStorageDB.SINGLETON = new GithubDiSuttaStorageDB()
    await GithubDiSuttaStorageDB.SINGLETON.setup()
    return GithubDiSuttaStorageDB.SINGLETON
}

export class GithubDiSuttaStorageDB implements AlbumStorageQueryable {
    public static SINGLETON: GithubDiSuttaStorageDB

    private _albumDbJson: AlbumDbJson = albumDb

    private _noOfWorkers: number = 1
    private _abortCachingOperation = false
    private _downloadScheduler = new DownloadWorkerScheduler()
    private _albumCacheStatusQuerier = new AlbumCacheStatusQuerier()

    public async setup() {
        if (!CacheUtils.ENABLE_CACHE)
            return
        const payload: RegisterRoutePayloadJson = {
            url_origin: ORIGIN,
            strategy: {
                class_name: CACHEFIRST_TEXTANDDOWNLOADS,
                cacheName: CACHE_NAME,
            }
        }
        await CacheUtils.postMessage({
            type: REGISTERROUTE,
            payload: payload
        })
        this._albumCacheStatusQuerier.setup()
    }

    public queryAlbumNames(): string[] {
        return Array.from(this._albumDbJson.albumName)
    }

    public queryAlbumReferences(): string[] {
        return Array.from(this._albumDbJson.albumBaseDirectory)
    }

    public queryTrackReferences(albIdx: number): string[] {
        albIdx = albIdx === -1 ? 0 : albIdx
        const albumRef = this._albumDbJson.albumBaseDirectory[albIdx]
        return this._queryTrackReferences(albumRef)
    }

    public queryTrackBaseRef(albIdx: number, trackIdx: number): string {
        if (albIdx === -1 || trackIdx === -1)
            return null
        const albumRef = this._albumDbJson.albumBaseDirectory[albIdx]
        const trackName = this._albumDbJson[albumRef as keyof typeof this._albumDbJson][trackIdx]
        const ret = `${albumRef}/${trackName}`
        return ret
    }

    public queryTrackSelection(baseRef: string): TrackSelection {
        const trackName = baseRef.replace(/^.*[\\\/]/, '')
        let albumRef = baseRef.substring(0, baseRef.length - trackName.length)
        if (albumRef.startsWith('/'))
            albumRef = albumRef.substring(1)
        if (albumRef.endsWith('/'))
            albumRef = albumRef.substring(0, albumRef.length-1)
        const albIdx = this._albumDbJson.albumBaseDirectory.indexOf(albumRef)
        const trackNames = this._queryTrackReferences(albumRef)
        const trkIdx = trackNames.indexOf(trackName)
        const ret = new TrackSelection('url', albIdx, trkIdx, baseRef)
        return ret
    }

    public async queryTrackText(baseRef: string): Promise<string> {
        const url = this.queryTrackTextUrl(baseRef)
        const ret = await this.readTextFile(url)
        return ret
    }

    public queryTrackTextUrl(baseRef: string): string {
        return UrlUtils.queryTrackTextUrl(baseRef)
    }

    public queryTrackHtmlAudioSrcRef(baseRef: string): string {
        return UrlUtils.queryTrackHtmlAudioSrcRef(baseRef)
    }

    public async readTextFile(url: string): Promise<string> {
        const isInCache = await CacheUtils.isInCache(CACHE_NAME, [url])
        if (!isInCache[0]) {
            const added = await CacheUtils.addCachedUrls(CACHE_NAME, [url])
            if (!added[0])
                return 'A network connection is required to access non-cached text!'
        }
        const resp = await CacheUtils.getFromCache(CACHE_NAME, [url]) // await fetch(url)
        const text = await resp[0].text()
        return text
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

    public queryAlbumCacheStatus(albIdx: number, onChecked: ProcessedItem): void {
        const albumRef = this._albumDbJson.albumBaseDirectory[albIdx]
        const baseRefs = this.queryTrackReferences(albIdx)
        this._albumCacheStatusQuerier.run(albIdx, albumRef, baseRefs, onChecked)
    }

    private _prepareBaseRefAsUrls(baseRef: string, txt: boolean, aud: boolean): string[] {
        const ret: string[] = [null, null]
        if (txt)
            ret[0] = this.queryTrackTextUrl(baseRef)
        if (aud)
            ret[1] = this.queryTrackHtmlAudioSrcRef(baseRef)
        return ret
    }

    protected _queryTrackReferences(colRef: string): string[] {
        const trackRefs = this._albumDbJson[colRef as keyof typeof this._albumDbJson]
        return Array.from(trackRefs)
    }

    public hasDownloadWorker(): boolean {
        return true
    }

    public setConcurrency(count: number): number {
        if (count > 3)
            throw new Error('GithubDiSuttaStorageDB does not support more than 3 concurrent workers')
        this._noOfWorkers = count
        return count
    }

    public async startDownloads(baseRefs: string[], onDownloaded: ProcessedItem): Promise<void> {
        this._abortCachingOperation = false
        this._downloadScheduler.setup(baseRefs.length, this._noOfWorkers, onDownloaded)
        for (let i = 0; i < baseRefs.length; i++) {
            if (this._abortCachingOperation) {
                this._downloadScheduler.abort()
                if (onDownloaded)
                    onDownloaded(baseRefs[i], i, null, {isLast: (i+1 === baseRefs.length), wasAborted: true})
                break
            }
            const rqst: TrackProcessRqstMsg = {
                baseRef: baseRefs[i],
                index: i
            }
            await this._downloadScheduler.download(rqst)
        }
    }

    public async startDeletes(baseRefs: string[], onDeleted: ProcessedItem): Promise<void> {
        this._abortCachingOperation = false
        for (let i = 0; i < baseRefs.length; i++) {
            if (this._abortCachingOperation) {
                if (onDeleted)
                    onDeleted(baseRefs[i], i, null, {isLast: (i+1 === baseRefs.length), wasAborted: true})
                break
            }
            const trackTxtUrl = this.queryTrackTextUrl(baseRefs[i])
            const trackAudUrl = this.queryTrackHtmlAudioSrcRef(baseRefs[i])
            const ret = await CacheUtils.deleteCachedUrls(CACHE_NAME, [trackTxtUrl, trackAudUrl])
            // console.log(ret)
            if (onDeleted)
                onDeleted(baseRefs[i], i, ret, {isLast: (i+1 === baseRefs.length), wasAborted: false})
        }
    }

    public abortOperation(): void {
        this._abortCachingOperation = true
    }
}

class DownloadWorkerScheduler {
    private _abort = false
    private _downloadsRemaining = 0 
    private _workers: Worker[]
    private _availableWorkers: Worker[]
    private _idWorkerAssignmentMap: Map<number, Worker>
    private _awaitNextAvailableWorker: DeferredPromise<Worker>
   
    public setup(rem: number, count: number, onDownloaded: ProcessedItem) {
        this._abort = false
        this._downloadsRemaining = rem
        this._workers = []
        this._availableWorkers = []
        this._idWorkerAssignmentMap = new Map<number, Worker>()
        this._awaitNextAvailableWorker = null
        for (let i = 0; i < count; i++) {
            const worker = new Worker('./esm/models/github-di/bg-tracks-download-worker.js', {type: 'module'})
            this._workers.push(worker)
            this._availableWorkers.push(worker)
            this._registerListener(worker, onDownloaded)
            console.log(`Download Worker[${i}] initialised`)
        }
    }

    private _registerListener(worker: Worker, onDownloaded: ProcessedItem) {
        worker.addEventListener('message', (event: MessageEvent) => {
            const base: WorkerMessage = event.data
            if (base.type === DOWNLOAD_TRACKS_RQST_MSG) {
                this._downloadsRemaining--
                const msg: TrackProcessRespMsg = base.payload
                const availableWorker = this._idWorkerAssignmentMap.get(base.id)
                const workerIdx = this._workers.indexOf(availableWorker)
                // console.log(`Download Worker[${workerIdx}] reporting on task id: ${base.id}`)
                // console.log(msg)
                this._idWorkerAssignmentMap.delete(base.id)
                this._availableWorkers.push(availableWorker)
                if (this._awaitNextAvailableWorker)
                    this._awaitNextAvailableWorker.resolve(availableWorker)
                const isLast = this._downloadsRemaining <= 0
                if (onDownloaded)
                    onDownloaded(msg.baseRef, msg.index, msg.txtAudStatus, {isLast: isLast, wasAborted: this._abort})
                if (isLast || this._abort)
                    this._tearDown()
            }
        })
    }

    public async download(rqst: TrackProcessRqstMsg) {
        const base =  WorkerFactory.createRqstMsg(DOWNLOAD_TRACKS_RQST_MSG, rqst)
        const worker = await this._getAvailableNextWorker()
        this._idWorkerAssignmentMap.set(base.id, worker)
        worker.postMessage(base)
    }

    public abort() {
        this._abort = true
    }

    private _tearDown() {
        for (let i = 0; i < this._workers.length; i++) {
            this._workers[i].terminate()
            console.log(`Download Worker[${i}] finalised`)
            this._workers[i] = null
        }
        this._workers = []
    }

    private async _getAvailableNextWorker(): Promise<Worker> {
        let nextWorker = this._availableWorkers.pop()
        if (nextWorker)
            return nextWorker
        if (!this._awaitNextAvailableWorker)
            this._awaitNextAvailableWorker = new DeferredPromise<Worker>()
        console.log('waiting for next available download worker...')
        nextWorker = await this._awaitNextAvailableWorker
        this._awaitNextAvailableWorker = null
        return nextWorker
    } 
}

class AlbumCacheStatusQuerier {
    private _worker: Worker
    private _lastStopToken: string = null
    private _onCheckedObserver: ProcessedItem

    public setup() {
        this._worker = new Worker('./esm/models/github-di/bg-tracks-status-worker.js', {type: 'module'})
        this._worker.addEventListener('message', (event: MessageEvent) => {
            const base: WorkerMessage = event.data
            if (base.type === CACHED_TRACKS_STATUS_RQST_MSG) {
                const msg: TrackStatusRespMsg = base.payload
                if (this._onCheckedObserver)
                    this._onCheckedObserver(msg.baseRef, msg.index, msg.txtAudStatus, {albumIndex: msg.albumIndex})
            } else if (base.type === CACHED_TRACKS_STATUS_FINISHED_RESP_MSG) 
              this._lastStopToken = null
        })
    }

    public run(albIdx: number, albumRef: string, baseRefs: string[], onCheckedObserver: ProcessedItem) {
        this._onCheckedObserver = onCheckedObserver
        if (this._lastStopToken) {
            WorkerFactory.signalWorkerHalt(this._lastStopToken)
            this._lastStopToken = null
        }
        const rqst: AlbumTrackRqstMsg = { albumIndex: albIdx, albumRef: albumRef, tracks: [] }
        for (let i = 0; i < baseRefs.length; i++) {
            const msg: TrackProcessRqstMsg = {
                baseRef: baseRefs[i],
                index: i
            }
            rqst.tracks.push(msg)
        }
        const base =  WorkerFactory.createRqstMsg(CACHED_TRACKS_STATUS_RQST_MSG, rqst)
        this._lastStopToken = base.stopToken
        // console.log(base)
        this._worker.postMessage(base)
    }

    public tearDown() {
        this._worker.terminate()
        this._worker = null
    }
}