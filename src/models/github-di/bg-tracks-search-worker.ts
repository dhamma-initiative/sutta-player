// import { DeferredPromise } from "../../runtime/deferred-promise.js"
import { DeferredPromise } from "../../runtime/deferred-promise.js"
import { StringUtils } from "../../runtime/string-utils.js"
import { WorkerFactory, WorkerMessage } from "../../runtime/worker-utils.js"
import { TrackSelection } from "../album-player-state.js"
import { MatchedTrackRespMsg, SEARCH_TRACKS_FINISHED_RESP_MSG, SEARCH_TRACKS_PAUSE_CHG_RESP_MSG, SEARCH_TRACKS_RQST_MSG, SEARCH_TRACKS_STATE_CHG_RQST_MSG, SearchTrackRqstMsg } from "./bg-tracks-commons.js"
import { InternalQueryCacheStore } from "./internal-query-cache-store.js"

class BackgroundSearchTracksWorker {
    public static DIACRITICS_CHR = ["ā", "ī", "ū", "ṁ", "ṃ", "ṇ", "ṅ", "ñ", "ṣ", "ṭ", "ḍ", "ḷ", "ḥ"]
    public static DIACRITICS_ALT = ["a", "i", "u", "m", "m", "n", "n", "n", "s", "t", "d", "l", "h"]

    private _albumStore = new InternalQueryCacheStore()
    private _searchSel = new TrackSelection('srchSrcIterator')
    private _baseMsg: WorkerMessage
    private _criteria: SearchTrackRqstMsg
    private _resumeAfterPauseWait: DeferredPromise<boolean>

    public async serve() {
        self.addEventListener('message', async (event: MessageEvent) => {
            const base: WorkerMessage = event.data
            if (base.type === SEARCH_TRACKS_RQST_MSG) {
                this._baseMsg = base
                this._criteria = base.payload
                await this._startSearch()
            } else if (base.type === SEARCH_TRACKS_STATE_CHG_RQST_MSG) {
                const criteria: SearchTrackRqstMsg = base.payload
                if (criteria.state === 0) // client requested continue
                    this._resumeAfterPauseWait.resolve(true)
                else if (criteria.state === 2) // client requestd abort
                    this._resumeAfterPauseWait.reject('Search Aborted!')
            }
        })
    }

    private async _startSearch() {
        let tracks = 0
        let occurances = [0]
        const albumSrcIndexes = this._getAlbumIndexes()
        this._resumeAfterPauseWait = new DeferredPromise<boolean>()
        for (let i = 0; i < albumSrcIndexes.length; i++) {
            this._searchSel.albumIndex = albumSrcIndexes[i]
            const trackCount = await this._getTrackCount()
            for (let j = 0; j < trackCount; j++) {
                if (await WorkerFactory.wasHaltSignalled(this._baseMsg.stopToken)) {
                    this._dispatchPauseChangedResponse(occurances[0], tracks, true)
                    await this._resumeAfterPauseWait
                    this._resumeAfterPauseWait = new DeferredPromise<boolean>()
                    this._dispatchPauseChangedResponse(occurances[0], tracks, false)
                }
                this._searchSel.trackIndex = j
                await this._searchSel.updateBaseRef(this._albumStore)
                if (this._criteria.searchScope === 1) {
                    const inCache = await this._albumStore.isInCache(this._searchSel.baseRef, true, false)
                    if (!inCache[0])
                        continue
                }
                const src = await this._getTrackSource()
                tracks = await this._checkForMatches(src, occurances, tracks)
            }
        }
        this._dispatchFinishedResponse(occurances[0], tracks)
    }
    
    private async _checkForMatches(src: string, occurances: number[], tracks: number): Promise<number> {
        const searchFor = this._criteria.searchFor
        const regExFlags = this._criteria.regExFlags
        const indexPositions = this._criteria.useRegEx ? StringUtils.allIndexOfUsingRegEx(src, searchFor, regExFlags) : StringUtils.allIndexesOf(src, searchFor) 
        if (indexPositions.length > 0) {
            tracks++
            const linePositions = StringUtils.allLinePositions(src, indexPositions)
            for (let i = 0; i < indexPositions.length; i++) {
                occurances[0]++
                this._dispatchMatchResponse(src, indexPositions[i], linePositions[i], tracks, occurances[0])
            }
        }
        return tracks
    }

    private _dispatchMatchResponse(src: string, idxPos: number, lineNum: number, occurances: number, tracks: number) {
        let matchCtx = StringUtils.surroundingTrim(src, idxPos, this._criteria.maxMatchSurroundingChars).replaceAll('\n', ' ')
        const msg: MatchedTrackRespMsg = {
            baseRef: this._searchSel.baseRef,
            idxPos: idxPos,
            lineNum: lineNum,
            totalLength: src.length,
            surroundingContext: matchCtx,
            cargo: {occurances: occurances, tracks: tracks}
        }
        const resp = {...this._baseMsg} 
        resp.type = SEARCH_TRACKS_RQST_MSG
        const respMsg = WorkerFactory.createRespMsg(resp, msg)
        self.postMessage(respMsg)        
    }

    private _dispatchPauseChangedResponse(occurances: number, tracks: number, paused: boolean) {
        const resp = {...this._baseMsg} 
        resp.type = SEARCH_TRACKS_PAUSE_CHG_RESP_MSG
        const respMsg = WorkerFactory.createRespMsg(resp, {occurances: occurances, tracks: tracks, paused: paused})
        self.postMessage(respMsg)        
    }

    private _dispatchFinishedResponse(occurances: number, tracks: number) {
        const resp = {...this._baseMsg} 
        resp.type = SEARCH_TRACKS_FINISHED_RESP_MSG
        const respMsg = WorkerFactory.createRespMsg(resp, {occurances: occurances, tracks: tracks})
        self.postMessage(respMsg)        
    }

    private async _getTrackSource(): Promise<string> {
        let src = await this._albumStore.queryTrackText(this._searchSel.baseRef)
        if (this._criteria.ignoreDiacritics) 
            src = this.removeDiacritics(src)
        return src
    }

    private removeDiacritics(src: string): string {
        for (let i = 0; i < BackgroundSearchTracksWorker.DIACRITICS_CHR.length; i++) 
            src = src.replaceAll(BackgroundSearchTracksWorker.DIACRITICS_CHR[i], BackgroundSearchTracksWorker.DIACRITICS_ALT[i])
        return src
    }

    private async _getTrackCount(): Promise<number> {
        const trackSrcRefs = await this._albumStore.queryTrackReferences(this._searchSel.albumIndex)
        return trackSrcRefs.length
    }

    private _getAlbumIndexes(): number[] {
        const ret = [this._criteria.albumIndex]
        if (this._criteria.searchScope > 0) {
            const albumSrcRefs = this._albumStore.queryAlbumReferences()
            for (let i = 0; i < albumSrcRefs.length; i++) {
                if (ret.indexOf(i) === -1) 
                    ret.push(i)
            }
        } 
        return ret
    }

    static {
        (async () => {
            const service = new BackgroundSearchTracksWorker()
            service.serve()
        })()
    }
}