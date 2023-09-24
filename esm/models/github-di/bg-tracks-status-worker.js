import { CacheUtils } from "../../runtime/cache-utils.js";
import { WorkerFactory } from "../../runtime/worker-utils.js";
import { CACHED_TRACKS_STATUS_FINISHED_RESP_MSG, CACHED_TRACKS_STATUS_RQST_MSG, CACHE_NAME, UrlUtils } from "./bg-tracks-commons.js";
class BackgroundTracksStatusWorker {
    async serve() {
        self.addEventListener('message', async (event) => {
            const baseMsg = event.data;
            if (baseMsg.type === CACHED_TRACKS_STATUS_RQST_MSG) {
                await this._queryCachedTracks(baseMsg, baseMsg.payload);
            }
        });
    }
    async _queryCachedTracks(base, msg) {
        for (let i = 0; i < msg.tracks.length; i++) {
            if (i > 50 && (i % 5 === 0)) {
                if (await WorkerFactory.wasHaltSignalled(base.stopToken))
                    break;
            }
            const baseRef = `${msg.albumRef}/${msg.tracks[i].baseRef}`;
            const txtUrl = UrlUtils.queryTrackTextUrl(baseRef);
            const audUrl = UrlUtils.queryTrackHtmlAudioSrcRef(baseRef);
            const status = await CacheUtils.isInCache(CACHE_NAME, [txtUrl, audUrl]);
            const payload = {
                albumIndex: msg.albumIndex,
                baseRef: msg.tracks[i].baseRef,
                index: i,
                txtAudStatus: status
            };
            const respMsg = WorkerFactory.createRespMsg(base, payload);
            // console.log(respMsg)
            self.postMessage(respMsg);
        }
        base.type = CACHED_TRACKS_STATUS_FINISHED_RESP_MSG;
        const respMsg = WorkerFactory.createRespMsg(base, {});
        // console.log(respMsg)
        self.postMessage(respMsg);
    }
    static {
        (async () => {
            const service = new BackgroundTracksStatusWorker();
            await service.serve();
        })();
    }
}
//# sourceMappingURL=bg-tracks-status-worker.js.map