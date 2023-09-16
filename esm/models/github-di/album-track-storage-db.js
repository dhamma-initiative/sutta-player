import { CACHEABLERESPONSEPLUGIN, CACHEFIRST, CacheUtils, REGISTERROUTE } from '../../runtime/cache-utils.js';
import { TrackSelection } from '../album-player-state.js';
import albumDb from './album-track-storage-db.json' assert { type: 'json' };
export async function createAlbumStorageQueryable() {
    return GithubDiSuttaStorageDB.SINGLETON;
}
export async function createAudioQueryable() {
    return GithubDiSuttaStorageDB.SINGLETON;
}
export class GithubDiSuttaStorageDB {
    static SINGLETON;
    static CACHE_NAME = 'dhamma-initiative.github.io';
    static ORIGIN = `https://${GithubDiSuttaStorageDB.CACHE_NAME}`;
    static {
        (async () => {
            GithubDiSuttaStorageDB.SINGLETON = new GithubDiSuttaStorageDB();
            await GithubDiSuttaStorageDB.SINGLETON.setup();
        })();
    }
    async setup() {
        if (!CacheUtils.ENABLE_CACHE)
            return;
        const payload = {
            url_origin: GithubDiSuttaStorageDB.ORIGIN,
            strategy: {
                class_name: CACHEFIRST,
                cacheName: GithubDiSuttaStorageDB.CACHE_NAME,
                plugins: [
                    {
                        class_name: CACHEABLERESPONSEPLUGIN,
                        options: {
                            statuses: [0, 200]
                        }
                    }
                ]
            }
        };
        await CacheUtils.postMessage({
            type: REGISTERROUTE,
            payload: payload
        });
    }
    queryAlbumNames() {
        return albumDb.albumName;
    }
    queryAlbumReferences() {
        return albumDb.albumBaseDirectory;
    }
    queryTrackReferences(albIdx) {
        albIdx = albIdx === -1 ? 0 : albIdx;
        const key = albumDb.albumBaseDirectory[albIdx];
        return this._queryTrackReferences(key);
    }
    queryTrackBaseRef(albIdx, trackIdx) {
        if (albIdx === -1 || trackIdx === -1)
            return null;
        const basePath = this.queryAlbumReferences()[albIdx];
        const baseName = this.queryTrackReferences(albIdx)[trackIdx];
        const ret = `${basePath}/${baseName}`;
        return ret;
    }
    queryTrackSelection(baseRef) {
        const baseName = baseRef.replace(/^.*[\\\/]/, '');
        let basePath = baseRef.substring(0, baseRef.length - baseName.length);
        if (basePath.startsWith('/'))
            basePath = basePath.substring(1);
        if (basePath.endsWith('/'))
            basePath = basePath.substring(0, basePath.length - 1);
        const albIdx = albumDb.albumBaseDirectory.indexOf(basePath);
        const lov = this._queryTrackReferences(basePath);
        const trkIdx = lov.indexOf(baseName);
        const ret = new TrackSelection('url', albIdx, trkIdx, baseRef);
        return ret;
    }
    async queryTrackText(baseRef) {
        const relPath = this.queryTrackTextUri(baseRef);
        const ret = await this.readTextFile(relPath);
        return ret;
    }
    queryTrackTextUri(baseRef) {
        const relPath = `${GithubDiSuttaStorageDB.ORIGIN}/${baseRef}.txt`;
        return relPath;
    }
    async readTextFile(relPath) {
        const resp = await fetch(relPath);
        const text = await resp.text();
        return text;
    }
    queryHtmlAudioSrcRef(baseRef) {
        const relPath = `${GithubDiSuttaStorageDB.ORIGIN}/${baseRef}.wav.mp3`;
        return relPath;
    }
    async isInCache(baseRef) {
        const trackTxtUri = this.queryTrackTextUri(baseRef);
        const ret = await CacheUtils.isInCache(GithubDiSuttaStorageDB.CACHE_NAME, [trackTxtUri], (resp) => {
            return resp?.ok ? true : false;
        });
        return ret[0];
    }
    async addToCache(baseRef) {
        const trackTxtUri = this.queryTrackTextUri(baseRef);
        const ret = await CacheUtils.addCachedUrls(GithubDiSuttaStorageDB.CACHE_NAME, [trackTxtUri]);
        return ret[0];
    }
    async removeFromCache(baseRef) {
        const trackTxtUri = this.queryTrackTextUri(baseRef);
        const ret = await CacheUtils.deleteCachedUrls(GithubDiSuttaStorageDB.CACHE_NAME, [trackTxtUri]);
        return ret[0];
    }
    _queryTrackReferences(colRef) {
        const trackRefs = albumDb[colRef];
        return trackRefs;
    }
}
//# sourceMappingURL=album-track-storage-db.js.map