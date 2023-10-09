import { CacheUtils } from "../../runtime/cache-utils.js";
import { TrackSelection } from "../album-player-state.js";
import { CACHE_NAME, UrlUtils } from "./bg-tracks-commons.js";
import albumIndexDb from './track-storage/0-album-index-db.json' assert { type: 'json' };
export class InternalQueryCacheStore {
    _albumIndexDbJson = albumIndexDb;
    _lastTrackReferencesRqstKey = null;
    _lastTrackReferencesRqstVal = null;
    _lastTrackReferencesRqstTimeoutHandle;
    queryAlbumNames() {
        return Array.from(this._albumIndexDbJson.albumName);
    }
    queryAlbumReferences() {
        return Array.from(this._albumIndexDbJson.albumBaseDirectory);
    }
    async queryTrackReferences(albIdx) {
        albIdx = albIdx === -1 ? 0 : albIdx;
        const albumRef = this._albumIndexDbJson.albumBaseDirectory[albIdx];
        return await this._queryTrackReferences(albumRef);
    }
    async queryTrackBaseRef(albIdx, trackIdx) {
        if (albIdx === -1 || trackIdx === -1)
            return null;
        const albumRef = this._albumIndexDbJson.albumBaseDirectory[albIdx];
        const tracks = await this._queryTrackReferences(albumRef);
        const trackName = tracks[trackIdx];
        const ret = `${albumRef}/${trackName}`;
        return ret;
    }
    async queryTrackSelection(baseRef) {
        const trackName = baseRef.replace(/^.*[\\\/]/, '');
        let albumRef = baseRef.substring(0, baseRef.length - trackName.length);
        if (albumRef.startsWith('/'))
            albumRef = albumRef.substring(1);
        if (albumRef.endsWith('/'))
            albumRef = albumRef.substring(0, albumRef.length - 1);
        const albIdx = this._albumIndexDbJson.albumBaseDirectory.indexOf(albumRef);
        const trackNames = await this._queryTrackReferences(albumRef);
        const trkIdx = trackNames.indexOf(trackName);
        const ret = new TrackSelection('url', albIdx, trkIdx, baseRef);
        return ret;
    }
    async queryTrackText(baseRef) {
        let ret = null;
        const url = this.queryTrackTextUrl(baseRef);
        const isInCacheChk = await this.isInCache(baseRef, true, false);
        if (isInCacheChk[0]) {
            const resp = await CacheUtils.getFromCache(CACHE_NAME, [url]);
            ret = await resp[0].text();
        }
        else
            ret = await this.readTextFile(url);
        return ret;
    }
    queryTrackTextUrl(baseRef) {
        return UrlUtils.queryTrackTextUrl(baseRef);
    }
    queryTrackHtmlAudioSrcRef(baseRef) {
        return UrlUtils.queryTrackHtmlAudioSrcRef(baseRef);
    }
    async readTextFile(url) {
        try {
            const resp = await fetch(url);
            const text = await resp.text();
            return text;
        }
        catch (e) {
            return 'Network error was error encountered!\nPlease check connection and reload app.';
        }
    }
    async isInCache(baseRef, txt, aud) {
        const src = this._prepareBaseRefAsUrls(baseRef, txt, aud);
        const ret = await CacheUtils.isInCache(CACHE_NAME, src, (resp, url) => {
            let ret = (resp?.type === 'opaque' && resp?.url === '');
            return ret;
            // return resp?.ok ? true : false 
        });
        return ret;
    }
    async addToCache(baseRef, txt, aud) {
        const urls = this._prepareBaseRefAsUrls(baseRef, txt, aud);
        const ret = await CacheUtils.addCachedUrls(CACHE_NAME, urls);
        return ret;
    }
    async removeFromCache(baseRef, txt, aud) {
        const src = this._prepareBaseRefAsUrls(baseRef, txt, aud);
        const ret = await CacheUtils.deleteCachedUrls(CACHE_NAME, src);
        return ret;
    }
    _prepareBaseRefAsUrls(baseRef, txt, aud) {
        const ret = [null, null];
        if (txt)
            ret[0] = this.queryTrackTextUrl(baseRef);
        if (aud)
            ret[1] = this.queryTrackHtmlAudioSrcRef(baseRef);
        return ret;
    }
    async _queryTrackReferences(colRef) {
        if (this._lastTrackReferencesRqstKey === colRef && this._lastTrackReferencesRqstVal) {
            this._startInMemoryTrackReferencesClearanceTime();
            return this._lastTrackReferencesRqstVal;
        }
        this._lastTrackReferencesRqstKey = colRef;
        colRef = colRef.replaceAll('/', '_');
        const dbFile = `/esm/models/github-di/track-storage/${colRef}-db.json`;
        const resp = await fetch(dbFile);
        const json = await resp.json();
        this._lastTrackReferencesRqstVal = json;
        this._startInMemoryTrackReferencesClearanceTime();
        return json;
    }
    _startInMemoryTrackReferencesClearanceTime() {
        clearTimeout(this._lastTrackReferencesRqstTimeoutHandle);
        this._lastTrackReferencesRqstTimeoutHandle = setTimeout(() => {
            this._lastTrackReferencesRqstKey = null;
            this._lastTrackReferencesRqstVal = null;
        }, 5000);
    }
}
//# sourceMappingURL=internal-query-cache-store.js.map