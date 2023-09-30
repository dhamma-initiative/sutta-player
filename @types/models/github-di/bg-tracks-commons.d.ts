import { MatchedSearchRef, SearchContext } from "../album-storage-queryable";
export declare const DOWNLOAD_TRACKS_RQST_MSG = "DOWNLOAD_TRACKS_RQST_MSG";
export declare const CACHED_TRACKS_STATUS_RQST_MSG = "CACHED_TRACKS_STATUS_RQST_MSG";
export declare const CACHED_TRACKS_STATUS_FINISHED_RESP_MSG = "CACHED_TRACKS_STATUS_FINISHED_RESP_MSG";
export declare const SEARCH_TRACKS_RQST_MSG = "SEARCH_TRACKS_RQST_MSG";
export declare const SEARCH_TRACKS_STATE_CHG_RQST_MSG = "SEARCH_TRACKS_STATE_CHG_RQST_MSG";
export declare const SEARCH_TRACKS_SEARCHING_TRACK_RESP_MSG = "SEARCH_TRACKS_SEARCHING_TRACK_RESP_MSG";
export declare const SEARCH_TRACKS_PAUSE_CHG_RESP_MSG = "SEARCH_TRACKS_PAUSE_CHG_RESP_MSG";
export declare const SEARCH_TRACKS_FINISHED_RESP_MSG = "SEARCH_TRACKS_FINISHED_RESP_MSG";
export declare const CACHE_NAME = "dhamma-initiative.github.io";
export declare const ORIGIN: string;
export interface TrackProcessRqstMsg {
    baseRef: string;
    index: number;
}
export interface TrackProcessRespMsg extends TrackProcessRqstMsg {
    txtAudStatus: boolean[];
}
export interface TrackStatusRespMsg {
    albumIndex: number;
    baseRef: string;
    index: number;
    txtAudStatus: boolean[];
}
export interface AlbumTrackRqstMsg {
    albumIndex: number;
    albumRef: string;
    tracks: TrackProcessRqstMsg[];
}
export type SearchTrackRqstMsg = SearchContext;
export type MatchedTrackRespMsg = MatchedSearchRef;
export declare class UrlUtils {
    static queryTrackTextUrl(baseRef: string): string;
    static queryTrackHtmlAudioSrcRef(baseRef: string): string;
}
