export const DOWNLOAD_TRACKS_RQST_MSG = 'DOWNLOAD_TRACKS_RQST_MSG';
export const CACHED_TRACKS_STATUS_RQST_MSG = 'CACHED_TRACKS_STATUS_RQST_MSG';
export const CACHED_TRACKS_STATUS_FINISHED_RESP_MSG = 'CACHED_TRACKS_STATUS_FINISHED_RESP_MSG';
export const SEARCH_TRACKS_RQST_MSG = 'SEARCH_TRACKS_RQST_MSG';
export const SEARCH_TRACKS_STATE_CHG_RQST_MSG = 'SEARCH_TRACKS_STATE_CHG_RQST_MSG';
export const SEARCH_TRACKS_PAUSE_CHG_RESP_MSG = 'SEARCH_TRACKS_PAUSE_CHG_RESP_MSG';
export const SEARCH_TRACKS_FINISHED_RESP_MSG = 'SEARCH_TRACKS_FINISHED_RESP_MSG';
export const CACHE_NAME = 'dhamma-initiative.github.io';
export const ORIGIN = `https://${CACHE_NAME}`;
export class UrlUtils {
    static queryTrackTextUrl(baseRef) {
        const relPath = `${ORIGIN}/${baseRef}.txt`;
        return relPath;
    }
    static queryTrackHtmlAudioSrcRef(baseRef) {
        const relPath = `${ORIGIN}/${baseRef}.wav.mp3`;
        return relPath;
    }
}
//# sourceMappingURL=bg-tracks-commons.js.map