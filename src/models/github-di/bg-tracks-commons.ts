export const DOWNLOAD_TRACKS_RQST_MSG = 'DOWNLOAD_TRACKS_RQST_MSG'
export const CACHED_TRACKS_STATUS_RQST_MSG = 'CACHED_TRACKS_STATUS_RQST_MSG'
export const CACHED_TRACKS_STATUS_FINISHED_RESP_MSG = 'CACHED_TRACKS_STATUS_FINISHED_RESP_MSG'

export const CACHE_NAME = 'dhamma-initiative.github.io'
export const ORIGIN = `https://${CACHE_NAME}`

export interface TrackProcessRqstMsg {
    baseRef: string
    index: number
}

export interface TrackProcessRespMsg extends TrackProcessRqstMsg {
    txtAudStatus: boolean[]
}

export interface TrackStatusRespMsg {
    albumIndex: number
    baseRef: string
    index: number
    txtAudStatus: boolean[]
}

export interface AlbumTrackRqstMsg {
    albumIndex: number
    albumRef: string
    tracks: TrackProcessRqstMsg[]
}

export class UrlUtils {
    public static queryTrackTextUrl(baseRef: string): string {
        const relPath = `${ORIGIN}/${baseRef}.txt`
        return relPath
    }

    public static queryTrackHtmlAudioSrcRef(baseRef: string): string {
        const relPath = `${ORIGIN}/${baseRef}.wav.mp3`
        return relPath
    }
}