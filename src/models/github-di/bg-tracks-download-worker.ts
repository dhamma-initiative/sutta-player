import { CacheUtils } from "../../runtime/cache-utils.js"
import { WorkerFactory, WorkerMessage } from "../../runtime/worker-utils.js"
import { CACHE_NAME, DOWNLOAD_TRACKS_RQST_MSG, TrackProcessRespMsg, TrackProcessRqstMsg, UrlUtils } from "./bg-tracks-commons.js"

class BackgroundTracksDownloadWorker {
    public async serve() {
        self.addEventListener('message', async (event: MessageEvent) => {
            const base: WorkerMessage = event.data
            if (base.type === DOWNLOAD_TRACKS_RQST_MSG) {
                const msg: TrackProcessRqstMsg = base.payload
                let resp = await this._downloadTrack(msg)
                self.postMessage(WorkerFactory.createRespMsg(base, resp))
            }
        })
    }

    private async _downloadTrack(msg: TrackProcessRqstMsg): Promise<TrackProcessRespMsg> {
        const txtUrl = UrlUtils.queryTrackTextUrl(msg.baseRef)
        const audUrl = UrlUtils.queryTrackHtmlAudioSrcRef(msg.baseRef)
        const ret: TrackProcessRespMsg = {
            ...msg, txtAudStatus: [false, false],
        }
        try {
            const wasOk = await CacheUtils.addCachedUrls(CACHE_NAME, [txtUrl, audUrl])
            ret.txtAudStatus = wasOk
        } catch (err) {
            console.log(err)
        }
        return ret
    }

    static {
        (async () => {
            const service = new BackgroundTracksDownloadWorker()
            service.serve()
        })()
    }
}