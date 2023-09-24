import { CacheUtils } from "../../runtime/cache-utils.js"
import { WorkerFactory, WorkerMessage } from "../../runtime/worker-utils.js"
import { AlbumTrackRqstMsg, CACHED_TRACKS_STATUS_FINISHED_RESP_MSG, CACHED_TRACKS_STATUS_RQST_MSG, CACHE_NAME, TrackStatusRespMsg, UrlUtils } from "./bg-tracks-commons.js"

class BackgroundTracksStatusWorker {
    public async serve() {
        self.addEventListener('message', async (event: MessageEvent) => {
            const baseMsg: WorkerMessage = event.data
            if (baseMsg.type === CACHED_TRACKS_STATUS_RQST_MSG) {
                await this._queryCachedTracks(baseMsg, <AlbumTrackRqstMsg> baseMsg.payload)
            }
        })
    }

    private async _queryCachedTracks(base: WorkerMessage, msg: AlbumTrackRqstMsg) {
        for (let i = 0; i < msg.tracks.length; i++) {
            if (i > 50 && (i % 5 === 0)) {
                if (await WorkerFactory.wasHaltSignalled(base.stopToken))
                    break
            }
            const baseRef = `${msg.albumRef}/${msg.tracks[i].baseRef}`
            const txtUrl = UrlUtils.queryTrackTextUrl(baseRef)
            const audUrl = UrlUtils.queryTrackHtmlAudioSrcRef(baseRef)
            const status = await CacheUtils.isInCache(CACHE_NAME, [txtUrl, audUrl])
            const payload: TrackStatusRespMsg = {
                albumIndex: msg.albumIndex,
                baseRef: msg.tracks[i].baseRef,
                index: i,
                txtAudStatus: status
            }
            const respMsg = WorkerFactory.createRespMsg(base, payload)
            // console.log(respMsg)
            self.postMessage(respMsg)
        }
        base.type = CACHED_TRACKS_STATUS_FINISHED_RESP_MSG
        const respMsg = WorkerFactory.createRespMsg(base, {})
        // console.log(respMsg)
        self.postMessage(respMsg)
    }

    static {
        (async () => {
            const service = new BackgroundTracksStatusWorker()
            await service.serve()
        })()
    }
}