import { TrackSelection } from "../models/album-player-state.js"

export const CACHED_TRACKS_STATUS_RQST_MSG = 'CACHED_TRACKS_STATUS_RQST_MSG'

export interface CachedTracksStatusRqstMsg {
    navSel: TrackSelection
    tracks: string[]

}

export interface CachedTracksStatusRespMsg {
    navSel: TrackSelection
    status: number[]
}