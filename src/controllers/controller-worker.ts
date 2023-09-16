import { CACHED_TRACKS_STATUS_RQST_MSG, CachedTracksStatusRespMsg, CachedTracksStatusRqstMsg } from "./controller-commons.js"

import appConfig from '../app-config.json' assert { type: 'json' }

import { AlbumStorageQueryable, AlbumStorageQueryableFactory } from '../models/album-storage-queryable.js'
import { AudioStorageQueryable, AudioStorageQueryableFactory } from '../models/audio-storage-queryable.js'
import { WorkerFactory, WorkerMessage } from "../runtime/worker-utils.js"

class ControllerWorker {
    private _albumStorage: AlbumStorageQueryable
    private _audioStorage: AudioStorageQueryable

    public async serve() {
        this._albumStorage = await AlbumStorageQueryableFactory.create(appConfig.AlbumStorageQueryableImpl)
        this._audioStorage = await AudioStorageQueryableFactory.create(appConfig.AudioStorageQueryableImpl)

        self.addEventListener('message', (event: MessageEvent) => {
            const baseMsg: WorkerMessage = event.data
            if (baseMsg.type === CACHED_TRACKS_STATUS_RQST_MSG) {
                this._fetchCachedTracks(baseMsg, <CachedTracksStatusRqstMsg> baseMsg.payload)
            }
        })
    }

    private async _fetchCachedTracks(base: WorkerMessage, msg: CachedTracksStatusRqstMsg) {
        let cachedResp: number[] = []
        const albumRef: string = <string> msg.navSel.dictionary['albumRef']
        for (let i = 0; i < msg.tracks.length; i++) {
            const track = `${albumRef}/${msg.tracks[i]}`
            const isInTxtCache = await this._albumStorage.isInCache(track)
            const isInAudCache = await this._audioStorage.isInCache(track)
            if (isInAudCache && isInTxtCache)
                cachedResp[i] = 3
            else if (isInAudCache)
                cachedResp[i] = 2
            else if (isInTxtCache)
                cachedResp[i] = 1
            else
                cachedResp[i] = 0
        }
        const payload: CachedTracksStatusRespMsg = {
            navSel: msg.navSel,
            status: cachedResp
        }
        self.postMessage(WorkerFactory.createRespMsg(base, payload))
    }

    static {
        (async () => {
            const service = new ControllerWorker()
            service.serve()
        })()
    }
}