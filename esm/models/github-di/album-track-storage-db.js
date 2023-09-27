import { CACHEFIRST_TEXTANDDOWNLOADS, CacheUtils, REGISTERROUTE } from '../../runtime/cache-utils.js';
import { DeferredPromise } from '../../runtime/deferred-promise.js';
import { WorkerFactory } from '../../runtime/worker-utils.js';
import { CACHED_TRACKS_STATUS_FINISHED_RESP_MSG, CACHED_TRACKS_STATUS_RQST_MSG, CACHE_NAME, DOWNLOAD_TRACKS_RQST_MSG, ORIGIN, SEARCH_TRACKS_FINISHED_RESP_MSG, SEARCH_TRACKS_PAUSE_CHG_RESP_MSG, SEARCH_TRACKS_RQST_MSG, SEARCH_TRACKS_STATE_CHG_RQST_MSG } from './bg-tracks-commons.js';
import { InternalQueryCacheStore } from './internal-query-cache-store.js';
export async function createAlbumStorageQueryable() {
    GithubDiSuttaStorageDB.SINGLETON = new GithubDiSuttaStorageDB();
    await GithubDiSuttaStorageDB.SINGLETON.setup();
    return GithubDiSuttaStorageDB.SINGLETON;
}
export class GithubDiSuttaStorageDB extends InternalQueryCacheStore {
    static SINGLETON;
    _noOfWorkers = 1;
    _abortCachingOperation = false;
    _downloadScheduler = new DownloadWorkerScheduler();
    _albumCacheStatusQuerier = new AlbumCacheStatusQuerier();
    async setup() {
        if (!CacheUtils.ENABLE_CACHE)
            return;
        const payload = {
            url_origin: ORIGIN,
            strategy: {
                class_name: CACHEFIRST_TEXTANDDOWNLOADS,
                cacheName: CACHE_NAME,
            }
        };
        await CacheUtils.postMessage({
            type: REGISTERROUTE,
            payload: payload
        });
        await this._albumCacheStatusQuerier.setup();
    }
    async queryAlbumCacheStatus(albIdx, onStatus) {
        const albumRef = this._albumIndexDbJson.albumBaseDirectory[albIdx];
        const baseRefs = await this.queryTrackReferences(albIdx);
        await this._albumCacheStatusQuerier.run(albIdx, albumRef, baseRefs, onStatus);
    }
    setConcurrency(count) {
        if (count > 3)
            throw new Error('GithubDiSuttaStorageDB does not support more than 3 concurrent workers');
        this._noOfWorkers = count;
        return count;
    }
    async startDownloads(baseRefs, onDownloaded) {
        this._abortCachingOperation = false;
        this._downloadScheduler.setup(baseRefs.length, this._noOfWorkers, onDownloaded);
        for (let i = 0; i < baseRefs.length; i++) {
            if (this._abortCachingOperation) {
                this._downloadScheduler.abort();
                if (onDownloaded)
                    onDownloaded(baseRefs[i], i, null, { isLast: (i + 1 === baseRefs.length), wasAborted: true });
                break;
            }
            const rqst = {
                baseRef: baseRefs[i],
                index: i
            };
            await this._downloadScheduler.download(rqst);
        }
    }
    async startDeletes(baseRefs, onDeleted) {
        this._abortCachingOperation = false;
        for (let i = 0; i < baseRefs.length; i++) {
            if (this._abortCachingOperation) {
                if (onDeleted)
                    onDeleted(baseRefs[i], i, null, { isLast: (i + 1 === baseRefs.length), wasAborted: true });
                break;
            }
            const trackTxtUrl = this.queryTrackTextUrl(baseRefs[i]);
            const trackAudUrl = this.queryTrackHtmlAudioSrcRef(baseRefs[i]);
            const ret = await CacheUtils.deleteCachedUrls(CACHE_NAME, [trackTxtUrl, trackAudUrl]);
            // console.log(ret)
            if (onDeleted)
                onDeleted(baseRefs[i], i, ret, { isLast: (i + 1 === baseRefs.length), wasAborted: false });
        }
    }
    abortOfflineOperation() {
        this._abortCachingOperation = true;
    }
    createSearchControl(criteria) {
        const ret = new SearchManager(criteria);
        return ret;
    }
    close() {
        this._albumCacheStatusQuerier.tearDown();
        this._downloadScheduler.tearDown();
    }
}
class DownloadWorkerScheduler {
    _abort = false;
    _downloadsRemaining = 0;
    _workers;
    _availableWorkers;
    _idWorkerAssignmentMap;
    _awaitNextAvailableWorker;
    setup(rem, count, onDownloaded) {
        this._abort = false;
        this._downloadsRemaining = rem;
        this._workers = [];
        this._availableWorkers = [];
        this._idWorkerAssignmentMap = new Map();
        this._awaitNextAvailableWorker = null;
        for (let i = 0; i < count; i++) {
            const worker = new Worker('/esm/models/github-di/bg-tracks-download-worker.js', { type: 'module' });
            this._workers.push(worker);
            this._availableWorkers.push(worker);
            this._registerListener(worker, onDownloaded);
            console.log(`Download Worker[${i}] initialised`);
        }
    }
    tearDown() {
    }
    _registerListener(worker, onDownloaded) {
        worker.addEventListener('message', (event) => {
            const base = event.data;
            if (base.type === DOWNLOAD_TRACKS_RQST_MSG) {
                this._downloadsRemaining--;
                const msg = base.payload;
                const availableWorker = this._idWorkerAssignmentMap.get(base.id);
                const workerIdx = this._workers.indexOf(availableWorker);
                // console.log(`Download Worker[${workerIdx}] reporting on task id: ${base.id}`)
                // console.log(msg)
                this._idWorkerAssignmentMap.delete(base.id);
                this._availableWorkers.push(availableWorker);
                if (this._awaitNextAvailableWorker)
                    this._awaitNextAvailableWorker.resolve(availableWorker);
                const isLast = this._downloadsRemaining <= 0;
                if (onDownloaded)
                    onDownloaded(msg.baseRef, msg.index, msg.txtAudStatus, { isLast: isLast, wasAborted: this._abort });
                if (isLast || this._abort)
                    this._cleanupAfterDownloads();
            }
        });
    }
    async download(rqst) {
        const base = await WorkerFactory.createRqstMsg(DOWNLOAD_TRACKS_RQST_MSG, rqst);
        const worker = await this._getAvailableNextWorker();
        this._idWorkerAssignmentMap.set(base.id, worker);
        worker.postMessage(base);
    }
    abort() {
        this._abort = true;
    }
    _cleanupAfterDownloads() {
        for (let i = 0; i < this._workers.length; i++) {
            this._workers[i].terminate();
            console.log(`Download Worker[${i}] finalised`);
            this._workers[i] = null;
        }
        this._awaitNextAvailableWorker = null;
        this._idWorkerAssignmentMap.clear();
        this._workers = [];
        this._downloadsRemaining = 0;
    }
    async _getAvailableNextWorker() {
        let nextWorker = this._availableWorkers.pop();
        if (nextWorker)
            return nextWorker;
        if (!this._awaitNextAvailableWorker)
            this._awaitNextAvailableWorker = new DeferredPromise();
        console.log('waiting for next available download worker...');
        nextWorker = await this._awaitNextAvailableWorker;
        this._awaitNextAvailableWorker = null;
        return nextWorker;
    }
}
class AlbumCacheStatusQuerier {
    _worker;
    _onStatus;
    _isProcessing = false;
    _stopToken;
    async setup() {
        this._worker = new Worker('/esm/models/github-di/bg-tracks-status-worker.js', { type: 'module' });
        this._stopToken = await WorkerFactory.createStopToken();
        this._worker.addEventListener('message', (event) => {
            const base = event.data;
            if (base.type === CACHED_TRACKS_STATUS_RQST_MSG) {
                const msg = base.payload;
                if (this._onStatus)
                    this._onStatus(msg.baseRef, msg.index, msg.txtAudStatus, { albumIndex: msg.albumIndex });
            }
            else if (base.type === CACHED_TRACKS_STATUS_FINISHED_RESP_MSG)
                this._isProcessing = false;
        });
    }
    async run(albIdx, albumRef, baseRefs, onStatus) {
        this._onStatus = onStatus;
        if (this._isProcessing) {
            await WorkerFactory.signalHalt(this._stopToken);
            this._isProcessing = false;
        }
        const rqst = { albumIndex: albIdx, albumRef: albumRef, tracks: [] };
        for (let i = 0; i < baseRefs.length; i++) {
            const msg = {
                baseRef: baseRefs[i],
                index: i
            };
            rqst.tracks.push(msg);
        }
        const base = await WorkerFactory.createRqstMsg(CACHED_TRACKS_STATUS_RQST_MSG, rqst, this._stopToken);
        this._worker.postMessage(base);
        this._stopToken = base.stopToken;
        this._isProcessing = true;
    }
    tearDown() {
        WorkerFactory.clearHalt(this._stopToken);
        this._worker.terminate();
        this._worker = null;
    }
}
class SearchManager {
    context;
    onStarted;
    onMatched;
    onPaused;
    onAborted;
    onFinished;
    _worker;
    _request;
    constructor(criteria) {
        this.context = criteria;
        this.context.state = -1;
        this._worker = new Worker('/esm/models/github-di/bg-tracks-search-worker.js', { type: 'module' });
        this._worker.addEventListener('message', (event) => {
            const base = event.data;
            if (base.type === SEARCH_TRACKS_RQST_MSG) {
                const msg = base.payload;
                if (this.onMatched)
                    this.onMatched(msg, msg.cargo);
            }
            else if (base.type === SEARCH_TRACKS_PAUSE_CHG_RESP_MSG) {
                let { occurances, tracks, paused } = base.payload;
                if (this.onPaused)
                    this.onPaused(paused, { occurances, tracks });
            }
            else if (base.type === SEARCH_TRACKS_FINISHED_RESP_MSG) {
                this.context.state = 3;
                if (this.onFinished)
                    this.onFinished(base.payload);
                this._tearDown();
            }
        });
    }
    async start() {
        this._request = await WorkerFactory.createRqstMsg(SEARCH_TRACKS_RQST_MSG, this.context);
        // console.log(this._lastRqst)
        this.context.state = 0;
        this._worker.postMessage(this._request);
        if (this.onStarted)
            this.onStarted();
    }
    async pause(paused) {
        if (paused && this.context.state === 0) {
            this.context.state = 1;
            await WorkerFactory.signalHalt(this._request.stopToken);
        }
        else if (!paused && this.context.state === 1) {
            this.context.state = 0;
            await WorkerFactory.signalHalt(this._request.stopToken, false);
            this._request.type = SEARCH_TRACKS_STATE_CHG_RQST_MSG;
            this._worker.postMessage(this._request);
        }
    }
    async abort() {
        if (this.context.state === 0 || this.context.state === 1) {
            this.context.state = 2;
            await this._tearDown();
            if (this.onAborted)
                this.onAborted();
        }
    }
    async _tearDown() {
        await WorkerFactory.clearHalt(this._request.stopToken);
        this._worker.terminate();
        this._worker = null;
        this._request = null;
    }
}
//# sourceMappingURL=album-track-storage-db.js.map