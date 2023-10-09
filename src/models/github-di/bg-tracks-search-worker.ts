import { DeferredPromise } from "../../runtime/deferred-promise.js"
import { StringUtils } from "../../runtime/string-utils.js"
import { WorkerFactory, WorkerMessage } from "../../runtime/worker-utils.js"
import { TrackSelection } from "../album-player-state.js"
import { MatchedTrackRespMsg, SEARCH_TRACKS_FINISHED_RESP_MSG, SEARCH_TRACKS_PAUSE_CHG_RESP_MSG, SEARCH_TRACKS_RQST_MSG, SEARCH_TRACKS_SEARCHING_TRACK_RESP_MSG, SEARCH_TRACKS_STATE_CHG_RQST_MSG, SearchTrackRqstMsg } from "./bg-tracks-commons.js"
import { InternalQueryCacheStore } from "./internal-query-cache-store.js"

class BackgroundSearchTracksWorker {
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
                    this._dispatchPauseChangedResponse(true, occurances[0], tracks)
                    await this._resumeAfterPauseWait
                    this._resumeAfterPauseWait = new DeferredPromise<boolean>()
                    this._dispatchPauseChangedResponse(false, occurances[0], tracks)
                }
                this._searchSel.trackIndex = j
                await this._searchSel.updateBaseRef(this._albumStore)
                if (this._criteria.searchScope === 1) {
                    const inCache = await this._albumStore.isInCache(this._searchSel.baseRef, true, false)
                    if (!inCache[0])
                        continue
                }
                const src = await this._getTrackSource()
                this._dispatchSearchingTrack(this._searchSel.baseRef, occurances[0], tracks)
                tracks = await this._checkForMatches(src, occurances, tracks)
            }
        }
        this._dispatchFinishedResponse(occurances[0], tracks)
    }
    
    private async _checkForMatches(src: string, occurances: number[], tracks: number): Promise<number> {
        const searchForAll = this._remDiacriticsAndSplitSearchTermsIfRqd(this._criteria.searchFor.trim())
        const searchFor = searchForAll[0]
        const regExFlags = this._criteria.regExFlags
        const indexPositions = this._criteria.useRegEx ? StringUtils.allIndexOfUsingRegEx(src, searchFor, regExFlags) : StringUtils.allIndexesOf(src, searchFor) 
        if (indexPositions.length > 0) {
            if (this._criteria.applyAndBetweenTerms) {
                const hasRemainingTerms = this._doesSrcIncludeAllRemainingTerms(src, searchForAll)
                if (!hasRemainingTerms)
                    return tracks
            }
            tracks++
            const linePositions = StringUtils.allLinePositions(src, indexPositions)
            for (let i = 0; i < indexPositions.length; i++) {
                occurances[0]++
                this._dispatchMatchResponse(src, indexPositions[i], linePositions[i], occurances[0], tracks)
            }
        }
        return tracks
    }

    private _remDiacriticsAndSplitSearchTermsIfRqd(searchFor: string): string[] {
        let ret: string[]
        if (this._criteria.applyAndBetweenTerms) {
            const terms = searchFor.split(' ').map((v, i, a) => {
                return v.toLowerCase().trim()
            })
            ret = terms
        } else
            ret = [searchFor]
        if (this._criteria.ignoreDiacritics)
            ret = ret.map((v, i, a) => {
                return StringUtils.removeDiacritics(v)
            })
        return ret
    }

    private _doesSrcIncludeAllRemainingTerms(src: string, searchForAll: string[], ignoreCase = true) {
        let useSrc = ignoreCase ? src.toLowerCase() : src
        if (this._criteria.ignoreDiacritics)
            useSrc = StringUtils.removeDiacritics(useSrc)
        for (let i = 1; i < searchForAll.length; i++) {
            if (useSrc.indexOf(searchForAll[i]) === -1)
                return false
        }
        return true
    }

    private _dispatchSearchingTrack(baseRef: string, occurances: number, tracks: number) {
        const resp = {...this._baseMsg} 
        resp.type = SEARCH_TRACKS_SEARCHING_TRACK_RESP_MSG
        const respMsg = WorkerFactory.createRespMsg(resp, {occurances: occurances, tracks: tracks, baseRef: baseRef})
        self.postMessage(respMsg)        
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

    private _dispatchPauseChangedResponse(paused: boolean, occurances: number, tracks: number) {
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
            src = StringUtils.removeDiacritics(src)
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