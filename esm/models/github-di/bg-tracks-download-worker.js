import { CacheUtils } from "../../runtime/cache-utils.js";
import { WorkerFactory } from "../../runtime/worker-utils.js";
import { CACHE_NAME, DOWNLOAD_TRACKS_RQST_MSG, UrlUtils } from "./bg-tracks-commons.js";
class BackgroundTracksDownloadWorker {
    async serve() {
        self.addEventListener('message', async (event) => {
            const base = event.data;
            if (base.type === DOWNLOAD_TRACKS_RQST_MSG) {
                const msg = base.payload;
                let resp = await this._downloadTrack(msg);
                self.postMessage(WorkerFactory.createRespMsg(base, resp));
            }
        });
    }
    async _downloadTrack(msg) {
        const txtUrl = UrlUtils.queryTrackTextUrl(msg.baseRef);
        const audUrl = UrlUtils.queryTrackHtmlAudioSrcRef(msg.baseRef);
        const ret = {
            ...msg, txtAudStatus: [false, false],
        };
        try {
            const wasOk = await CacheUtils.addCachedUrls(CACHE_NAME, [txtUrl, audUrl]);
            ret.txtAudStatus = wasOk;
        }
        catch (err) {
            console.log(err);
        }
        return ret;
    }
    static {
        (async () => {
            const service = new BackgroundTracksDownloadWorker();
            service.serve();
        })();
    }
}
//# sourceMappingURL=bg-tracks-download-worker.js.map