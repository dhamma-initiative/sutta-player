import { CACHED_TRACKS_STATUS_RQST_MSG } from "./controller-commons.js";
import appConfig from '../app-config.json' assert { type: 'json' };
import { AlbumStorageQueryableFactory } from '../models/album-storage-queryable.js';
import { AudioStorageQueryableFactory } from '../models/audio-storage-queryable.js';
import { WorkerFactory } from "../runtime/worker-utils.js";
class ControllerWorker {
    _albumStorage;
    _audioStorage;
    async serve() {
        this._albumStorage = await AlbumStorageQueryableFactory.create(appConfig.SuttaStorageQueryableImpl);
        this._audioStorage = await AudioStorageQueryableFactory.create(appConfig.AudioStorageQueryableImpl);
        self.addEventListener('message', (event) => {
            const baseMsg = event.data;
            if (baseMsg.type === CACHED_TRACKS_STATUS_RQST_MSG) {
                this._fetchCachedTracks(baseMsg, baseMsg.payload);
            }
        });
    }
    async _fetchCachedTracks(base, msg) {
        let cachedResp = [];
        const albumRef = msg.navSel.dictionary['albumRef'];
        for (let i = 0; i < msg.tracks.length; i++) {
            const track = `${albumRef}/${msg.tracks[i]}`;
            const isInTxtCache = await this._albumStorage.isInCache(track);
            const isInAudCache = await this._audioStorage.isInCache(track);
            if (isInAudCache && isInTxtCache)
                cachedResp[i] = 3;
            else if (isInAudCache)
                cachedResp[i] = 2;
            else if (isInTxtCache)
                cachedResp[i] = 1;
            else
                cachedResp[i] = 0;
        }
        const payload = {
            navSel: msg.navSel,
            status: cachedResp
        };
        self.postMessage(WorkerFactory.createRespMsg(base, payload));
    }
    static {
        (async () => {
            const service = new ControllerWorker();
            service.serve();
        })();
    }
}
//# sourceMappingURL=controller-worker.js.map