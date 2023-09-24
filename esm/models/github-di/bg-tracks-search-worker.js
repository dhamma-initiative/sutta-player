// import { DeferredPromise } from "../../runtime/deferred-promise.js"
import { DeferredPromise } from "../../runtime/deferred-promise.js";
import { StringUtils } from "../../runtime/string-utils.js";
import { WorkerFactory } from "../../runtime/worker-utils.js";
import { TrackSelection } from "../album-player-state.js";
import { SEARCH_TRACKS_FINISHED_RESP_MSG, SEARCH_TRACKS_PAUSE_CHG_RESP_MSG, SEARCH_TRACKS_RQST_MSG, SEARCH_TRACKS_STATE_CHG_RQST_MSG } from "./bg-tracks-commons.js";
import { InternalQueryCacheStore } from "./internal-query-cache-store.js";
class BackgroundSearchTracksWorker {
    static DIACRITICS_CHR = ["ā", "ī", "ū", "ṁ", "ṃ", "ṇ", "ṅ", "ñ", "ṣ", "ṭ", "ḍ", "ḷ", "ḥ"];
    static DIACRITICS_ALT = ["a", "i", "u", "m", "m", "n", "n", "n", "s", "t", "d", "l", "h"];
    _albumStore = new InternalQueryCacheStore();
    _searchSel = new TrackSelection('srchSrcIterator');
    _baseMsg;
    _criteria;
    _resumeAfterPauseWait;
    async serve() {
        self.addEventListener('message', async (event) => {
            const base = event.data;
            if (base.type === SEARCH_TRACKS_RQST_MSG) {
                this._baseMsg = base;
                this._criteria = base.payload;
                await this._startSearch();
            }
            else if (base.type === SEARCH_TRACKS_STATE_CHG_RQST_MSG) {
                const criteria = base.payload;
                if (criteria.state === 0) // client requested continue
                    this._resumeAfterPauseWait.resolve(true);
                else if (criteria.state === 2) // client requestd abort
                    this._resumeAfterPauseWait.reject('Search Aborted!');
            }
        });
    }
    async _startSearch() {
        let tracks = 0;
        let occurances = [0];
        const albumSrcIndexes = this._getAlbumIndexes();
        this._resumeAfterPauseWait = new DeferredPromise();
        for (let i = 0; i < albumSrcIndexes.length; i++) {
            this._searchSel.albumIndex = albumSrcIndexes[i];
            const trackCount = await this._getTrackCount();
            for (let j = 0; j < trackCount; j++) {
                if (await WorkerFactory.wasHaltSignalled(this._baseMsg.stopToken)) {
                    this._dispatchPauseChangedResponse(occurances[0], tracks, true);
                    await this._resumeAfterPauseWait;
                    this._resumeAfterPauseWait = new DeferredPromise();
                    this._dispatchPauseChangedResponse(occurances[0], tracks, false);
                }
                this._searchSel.trackIndex = j;
                await this._searchSel.updateBaseRef(this._albumStore);
                if (this._criteria.searchScope === 1) {
                    const inCache = await this._albumStore.isInCache(this._searchSel.baseRef, true, false);
                    if (!inCache[0])
                        continue;
                }
                const src = await this._getTrackSource();
                tracks = await this._checkForMatches(src, occurances, tracks);
            }
        }
        this._dispatchFinishedResponse(occurances[0], tracks);
    }
    async _checkForMatches(src, occurances, tracks) {
        const searchFor = this._criteria.searchFor;
        const regExFlags = this._criteria.regExFlags;
        const indexPositions = this._criteria.useRegEx ? StringUtils.allIndexOfUsingRegEx(src, searchFor, regExFlags) : StringUtils.allIndexesOf(src, searchFor);
        if (indexPositions.length > 0) {
            tracks++;
            const linePositions = StringUtils.allLinePositions(src, indexPositions);
            for (let i = 0; i < indexPositions.length; i++) {
                occurances[0]++;
                this._dispatchMatchResponse(src, indexPositions[i], linePositions[i], tracks, occurances[0]);
            }
        }
        return tracks;
    }
    _dispatchMatchResponse(src, idxPos, lineNum, occurances, tracks) {
        let matchCtx = StringUtils.surroundingTrim(src, idxPos, this._criteria.maxMatchSurroundingChars).replaceAll('\n', ' ');
        const msg = {
            baseRef: this._searchSel.baseRef,
            idxPos: idxPos,
            lineNum: lineNum,
            totalLength: src.length,
            surroundingContext: matchCtx,
            cargo: { occurances: occurances, tracks: tracks }
        };
        const resp = { ...this._baseMsg };
        resp.type = SEARCH_TRACKS_RQST_MSG;
        const respMsg = WorkerFactory.createRespMsg(resp, msg);
        self.postMessage(respMsg);
    }
    _dispatchPauseChangedResponse(occurances, tracks, paused) {
        const resp = { ...this._baseMsg };
        resp.type = SEARCH_TRACKS_PAUSE_CHG_RESP_MSG;
        const respMsg = WorkerFactory.createRespMsg(resp, { occurances: occurances, tracks: tracks, paused: paused });
        self.postMessage(respMsg);
    }
    _dispatchFinishedResponse(occurances, tracks) {
        const resp = { ...this._baseMsg };
        resp.type = SEARCH_TRACKS_FINISHED_RESP_MSG;
        const respMsg = WorkerFactory.createRespMsg(resp, { occurances: occurances, tracks: tracks });
        self.postMessage(respMsg);
    }
    async _getTrackSource() {
        let src = await this._albumStore.queryTrackText(this._searchSel.baseRef);
        if (this._criteria.ignoreDiacritics)
            src = this.removeDiacritics(src);
        return src;
    }
    removeDiacritics(src) {
        for (let i = 0; i < BackgroundSearchTracksWorker.DIACRITICS_CHR.length; i++)
            src = src.replaceAll(BackgroundSearchTracksWorker.DIACRITICS_CHR[i], BackgroundSearchTracksWorker.DIACRITICS_ALT[i]);
        return src;
    }
    async _getTrackCount() {
        const trackSrcRefs = await this._albumStore.queryTrackReferences(this._searchSel.albumIndex);
        return trackSrcRefs.length;
    }
    _getAlbumIndexes() {
        const ret = [this._criteria.albumIndex];
        if (this._criteria.searchScope > 0) {
            const albumSrcRefs = this._albumStore.queryAlbumReferences();
            for (let i = 0; i < albumSrcRefs.length; i++) {
                if (ret.indexOf(i) === -1)
                    ret.push(i);
            }
        }
        return ret;
    }
    static {
        (async () => {
            const service = new BackgroundSearchTracksWorker();
            service.serve();
        })();
    }
}
//# sourceMappingURL=bg-tracks-search-worker.js.map