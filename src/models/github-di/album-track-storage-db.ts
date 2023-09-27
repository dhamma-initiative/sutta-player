import { CACHEFIRST_TEXTANDDOWNLOADS, CacheUtils, REGISTERROUTE, RegisterRoutePayloadJson } from '../../runtime/cache-utils.js'
import { DeferredPromise } from '../../runtime/deferred-promise.js'
import { WorkerFactory, WorkerMessage } from '../../runtime/worker-utils.js'
import { AlbumStorageQueryable, MatchedSearchItem, ProcessedItem, SearchContext, SearchControl } from '../album-storage-queryable.js'
import { AlbumTrackRqstMsg, CACHED_TRACKS_STATUS_FINISHED_RESP_MSG, CACHED_TRACKS_STATUS_RQST_MSG, CACHE_NAME, DOWNLOAD_TRACKS_RQST_MSG, MatchedTrackRespMsg, ORIGIN, SEARCH_TRACKS_FINISHED_RESP_MSG, SEARCH_TRACKS_PAUSE_CHG_RESP_MSG, SEARCH_TRACKS_RQST_MSG, SEARCH_TRACKS_STATE_CHG_RQST_MSG, SearchTrackRqstMsg, TrackProcessRespMsg, TrackProcessRqstMsg, TrackStatusRespMsg } from './bg-tracks-commons.js'

import { InternalQueryCacheStore } from './internal-query-cache-store.js'

export async function createAlbumStorageQueryable(): Promise<AlbumStorageQueryable> {
    GithubDiSuttaStorageDB.SINGLETON = new GithubDiSuttaStorageDB()
    await GithubDiSuttaStorageDB.SINGLETON.setup()
    return GithubDiSuttaStorageDB.SINGLETON
}

export class GithubDiSuttaStorageDB extends InternalQueryCacheStore implements AlbumStorageQueryable {
    public static SINGLETON: GithubDiSuttaStorageDB

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
        await this._albumCacheStatusQuerier.setup()
    }

    public async queryAlbumCacheStatus(albIdx: number, onStatus: ProcessedItem): Promise<void> {
        const albumRef = this._albumIndexDbJson.albumBaseDirectory[albIdx]
        const baseRefs = await this.queryTrackReferences(albIdx)
        await this._albumCacheStatusQuerier.run(albIdx, albumRef, baseRefs, onStatus)
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

    public abortOfflineOperation(): void {
        this._abortCachingOperation = true
    }

    public createSearchControl(criteria: SearchContext): SearchControl {
        const ret = new SearchManager(criteria)
        return ret        
    }

    public close(): void {
        this._albumCacheStatusQuerier.tearDown()
        this._downloadScheduler.tearDown()
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
            const worker = new Worker('/esm/models/github-di/bg-tracks-download-worker.js', {type: 'module'})
            this._workers.push(worker)
            this._availableWorkers.push(worker)
            this._registerListener(worker, onDownloaded)
            console.log(`Download Worker[${i}] initialised`)
        }
    }

    public tearDown() {
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
                    this._cleanupAfterDownloads()
            }
        })
    }

    public async download(rqst: TrackProcessRqstMsg) {
        const base =  await WorkerFactory.createRqstMsg(DOWNLOAD_TRACKS_RQST_MSG, rqst)
        const worker = await this._getAvailableNextWorker()
        this._idWorkerAssignmentMap.set(base.id, worker)
        worker.postMessage(base)
    }

    public abort() {
        this._abort = true
    }

    private _cleanupAfterDownloads() {
        for (let i = 0; i < this._workers.length; i++) {
            this._workers[i].terminate()
            console.log(`Download Worker[${i}] finalised`)
            this._workers[i] = null
        }
        this._awaitNextAvailableWorker = null
        this._idWorkerAssignmentMap.clear()
        this._workers = []
        this._downloadsRemaining = 0
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
    private _onStatus: ProcessedItem
    private _isProcessing = false
    private _stopToken: string

    public async setup() {
        this._worker = new Worker('/esm/models/github-di/bg-tracks-status-worker.js', {type: 'module'})
        this._stopToken = await WorkerFactory.createStopToken()
        this._worker.addEventListener('message', (event: MessageEvent) => {
            const base: WorkerMessage = event.data
            if (base.type === CACHED_TRACKS_STATUS_RQST_MSG) {
                const msg: TrackStatusRespMsg = base.payload
                if (this._onStatus)
                    this._onStatus(msg.baseRef, msg.index, msg.txtAudStatus, {albumIndex: msg.albumIndex})
            } else if (base.type === CACHED_TRACKS_STATUS_FINISHED_RESP_MSG) 
                this._isProcessing = false
        })
    }

    public async run(albIdx: number, albumRef: string, baseRefs: string[], onStatus: ProcessedItem) {
        this._onStatus = onStatus
        if (this._isProcessing) {
            await WorkerFactory.signalHalt(this._stopToken)
            this._isProcessing = false
        }
        const rqst: AlbumTrackRqstMsg = { albumIndex: albIdx, albumRef: albumRef, tracks: [] }
        for (let i = 0; i < baseRefs.length; i++) {
            const msg: TrackProcessRqstMsg = {
                baseRef: baseRefs[i],
                index: i
            }
            rqst.tracks.push(msg)
        }
        const base =  await WorkerFactory.createRqstMsg(CACHED_TRACKS_STATUS_RQST_MSG, rqst, this._stopToken)
        this._worker.postMessage(base)
        this._stopToken = base.stopToken
        this._isProcessing = true
    }

    public tearDown() {
        WorkerFactory.clearHalt(this._stopToken)
        this._worker.terminate()
        this._worker = null
    }
}


class SearchManager implements SearchControl {
    context: SearchContext
    onStarted: () => void
    onMatched: MatchedSearchItem
    onPaused: (paused: boolean, cargo?: any) => void
    onAborted: () => void
    onFinished: (cargo?: any) => void 
    
    private _worker: Worker
    private _request: WorkerMessage

    constructor(criteria: SearchContext) {
        this.context = criteria
        this.context.state = -1
        this._worker = new Worker('/esm/models/github-di/bg-tracks-search-worker.js', {type: 'module'})
        this._worker.addEventListener('message', (event: MessageEvent) => {
            const base: WorkerMessage = event.data
            if (base.type === SEARCH_TRACKS_RQST_MSG) {
                const msg: MatchedTrackRespMsg = base.payload
                if (this.onMatched)
                    this.onMatched(msg, msg.cargo)
            } else if (base.type === SEARCH_TRACKS_PAUSE_CHG_RESP_MSG) {
                let {occurances, tracks, paused} = base.payload
                if (this.onPaused)
                    this.onPaused(paused, {occurances, tracks})
            } else if (base.type === SEARCH_TRACKS_FINISHED_RESP_MSG) {
                this.context.state = 3
                if (this.onFinished)
                    this.onFinished(base.payload)
                this._tearDown()
            }
        })
    }

    public async start() {
        this._request = await WorkerFactory.createRqstMsg(SEARCH_TRACKS_RQST_MSG, this.context)
        // console.log(this._lastRqst)
        this.context.state = 0
        this._worker.postMessage(this._request)
        if (this.onStarted)
            this.onStarted()
    }

    public async pause(paused: boolean) {
        if (paused && this.context.state === 0) {
            this.context.state = 1
            await WorkerFactory.signalHalt(this._request.stopToken)
        } else if (!paused && this.context.state === 1) {
            this.context.state = 0
            await WorkerFactory.signalHalt(this._request.stopToken, false)
            this._request.type = SEARCH_TRACKS_STATE_CHG_RQST_MSG
            this._worker.postMessage(this._request)
        }
    }

    public async abort() {
        if (this.context.state === 0 || this.context.state === 1) {
            this.context.state = 2
            await this._tearDown()
            if (this.onAborted)
                this.onAborted()
        }
    }

    private async _tearDown() {
        await WorkerFactory.clearHalt(this._request.stopToken)
        this._worker.terminate()
        this._worker = null
        this._request = null
    }
}