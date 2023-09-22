import { CACHEFIRST_TEXTANDDOWNLOADS, CacheUtils, REGISTERROUTE } from '../../runtime/cache-utils.js';
import { DeferredPromise } from '../../runtime/deferred-promise.js';
import { WorkerFactory } from '../../runtime/worker-utils.js';
import { TrackSelection } from '../album-player-state.js';
import { CACHED_TRACKS_STATUS_FINISHED_RESP_MSG, CACHED_TRACKS_STATUS_RQST_MSG, CACHE_NAME, DOWNLOAD_TRACKS_RQST_MSG, ORIGIN, UrlUtils } from './bg-tracks-commons.js';
import albumDb from './album-track-storage-db.json' assert { type: 'json' };
export async function createAlbumStorageQueryable() {
    GithubDiSuttaStorageDB.SINGLETON = new GithubDiSuttaStorageDB();
    await GithubDiSuttaStorageDB.SINGLETON.setup();
    return GithubDiSuttaStorageDB.SINGLETON;
}
export class GithubDiSuttaStorageDB {
    static SINGLETON;
    _albumDbJson = albumDb;
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
        this._albumCacheStatusQuerier.setup();
    }
    queryAlbumNames() {
        return Array.from(this._albumDbJson.albumName);
    }
    queryAlbumReferences() {
        return Array.from(this._albumDbJson.albumBaseDirectory);
    }
    queryTrackReferences(albIdx) {
        albIdx = albIdx === -1 ? 0 : albIdx;
        const albumRef = this._albumDbJson.albumBaseDirectory[albIdx];
        return this._queryTrackReferences(albumRef);
    }
    queryTrackBaseRef(albIdx, trackIdx) {
        if (albIdx === -1 || trackIdx === -1)
            return null;
        const albumRef = this._albumDbJson.albumBaseDirectory[albIdx];
        const trackName = this._albumDbJson[albumRef][trackIdx];
        const ret = `${albumRef}/${trackName}`;
        return ret;
    }
    queryTrackSelection(baseRef) {
        const trackName = baseRef.replace(/^.*[\\\/]/, '');
        let albumRef = baseRef.substring(0, baseRef.length - trackName.length);
        if (albumRef.startsWith('/'))
            albumRef = albumRef.substring(1);
        if (albumRef.endsWith('/'))
            albumRef = albumRef.substring(0, albumRef.length - 1);
        const albIdx = this._albumDbJson.albumBaseDirectory.indexOf(albumRef);
        const trackNames = this._queryTrackReferences(albumRef);
        const trkIdx = trackNames.indexOf(trackName);
        const ret = new TrackSelection('url', albIdx, trkIdx, baseRef);
        return ret;
    }
    async queryTrackText(baseRef) {
        const url = this.queryTrackTextUrl(baseRef);
        const ret = await this.readTextFile(url);
        return ret;
    }
    queryTrackTextUrl(baseRef) {
        return UrlUtils.queryTrackTextUrl(baseRef);
    }
    queryTrackHtmlAudioSrcRef(baseRef) {
        return UrlUtils.queryTrackHtmlAudioSrcRef(baseRef);
    }
    async readTextFile(url) {
        const isInCache = await CacheUtils.isInCache(CACHE_NAME, [url]);
        if (!isInCache[0]) {
            const added = await CacheUtils.addCachedUrls(CACHE_NAME, [url]);
            if (!added[0])
                return 'A network connection is required to access non-cached text!';
        }
        const resp = await CacheUtils.getFromCache(CACHE_NAME, [url]); // await fetch(url)
        const text = await resp[0].text();
        return text;
    }
    async isInCache(baseRef, txt, aud) {
        const src = this._prepareBaseRefAsUrls(baseRef, txt, aud);
        const ret = await CacheUtils.isInCache(CACHE_NAME, src, (resp, url) => {
            let ret = (resp?.type === 'opaque' && resp?.url === '');
            return ret;
            // return resp?.ok ? true : false 
        });
        return ret;
    }
    async addToCache(baseRef, txt, aud) {
        const urls = this._prepareBaseRefAsUrls(baseRef, txt, aud);
        const ret = await CacheUtils.addCachedUrls(CACHE_NAME, urls);
        return ret;
    }
    async removeFromCache(baseRef, txt, aud) {
        const src = this._prepareBaseRefAsUrls(baseRef, txt, aud);
        const ret = await CacheUtils.deleteCachedUrls(CACHE_NAME, src);
        return ret;
    }
    queryAlbumCacheStatus(albIdx, onChecked) {
        const albumRef = this._albumDbJson.albumBaseDirectory[albIdx];
        const baseRefs = this.queryTrackReferences(albIdx);
        this._albumCacheStatusQuerier.run(albIdx, albumRef, baseRefs, onChecked);
    }
    _prepareBaseRefAsUrls(baseRef, txt, aud) {
        const ret = [null, null];
        if (txt)
            ret[0] = this.queryTrackTextUrl(baseRef);
        if (aud)
            ret[1] = this.queryTrackHtmlAudioSrcRef(baseRef);
        return ret;
    }
    _queryTrackReferences(colRef) {
        const trackRefs = this._albumDbJson[colRef];
        return Array.from(trackRefs);
    }
    hasDownloadWorker() {
        return true;
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
    abortOperation() {
        this._abortCachingOperation = true;
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
            const worker = new Worker('./esm/models/github-di/bg-tracks-download-worker.js', { type: 'module' });
            this._workers.push(worker);
            this._availableWorkers.push(worker);
            this._registerListener(worker, onDownloaded);
            console.log(`Download Worker[${i}] initialised`);
        }
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
                    this._tearDown();
            }
        });
    }
    async download(rqst) {
        const base = WorkerFactory.createRqstMsg(DOWNLOAD_TRACKS_RQST_MSG, rqst);
        const worker = await this._getAvailableNextWorker();
        this._idWorkerAssignmentMap.set(base.id, worker);
        worker.postMessage(base);
    }
    abort() {
        this._abort = true;
    }
    _tearDown() {
        for (let i = 0; i < this._workers.length; i++) {
            this._workers[i].terminate();
            console.log(`Download Worker[${i}] finalised`);
            this._workers[i] = null;
        }
        this._workers = [];
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
    _lastStopToken = null;
    _onCheckedObserver;
    setup() {
        this._worker = new Worker('./esm/models/github-di/bg-tracks-status-worker.js', { type: 'module' });
        this._worker.addEventListener('message', (event) => {
            const base = event.data;
            if (base.type === CACHED_TRACKS_STATUS_RQST_MSG) {
                const msg = base.payload;
                if (this._onCheckedObserver)
                    this._onCheckedObserver(msg.baseRef, msg.index, msg.txtAudStatus, { albumIndex: msg.albumIndex });
            }
            else if (base.type === CACHED_TRACKS_STATUS_FINISHED_RESP_MSG)
                this._lastStopToken = null;
        });
    }
    run(albIdx, albumRef, baseRefs, onCheckedObserver) {
        this._onCheckedObserver = onCheckedObserver;
        if (this._lastStopToken) {
            WorkerFactory.signalWorkerHalt(this._lastStopToken);
            this._lastStopToken = null;
        }
        const rqst = { albumIndex: albIdx, albumRef: albumRef, tracks: [] };
        for (let i = 0; i < baseRefs.length; i++) {
            const msg = {
                baseRef: baseRefs[i],
                index: i
            };
            rqst.tracks.push(msg);
        }
        const base = WorkerFactory.createRqstMsg(CACHED_TRACKS_STATUS_RQST_MSG, rqst);
        this._lastStopToken = base.stopToken;
        // console.log(base)
        this._worker.postMessage(base);
    }
    tearDown() {
        this._worker.terminate();
        this._worker = null;
    }
}
//# sourceMappingURL=album-track-storage-db.js.map