import { TrackSelection } from '../sutta-player-state.js';
import suttaDb from './sutta-db.json' assert { type: 'json' };
export async function createSuttaStorageQueryable() {
    const ret = new JsonFsSuttaDB();
    return ret;
}
export class JsonFsSuttaDB {
    queryAlbumNames() {
        return suttaDb.albumName;
    }
    queryAlbumReferences() {
        return suttaDb.albumBaseDirectory;
    }
    queryTrackReferences(albIdx) {
        albIdx = albIdx === -1 ? 0 : albIdx;
        const key = suttaDb.albumBaseDirectory[albIdx];
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
        const albIdx = suttaDb.albumBaseDirectory.indexOf(basePath);
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
        const relPath = `./text/suttas/${baseRef}.txt`;
        return relPath;
    }
    async readTextFile(relPath) {
        const resp = await fetch(relPath);
        const text = await resp.text();
        return text;
    }
    _queryTrackReferences(colRef) {
        const trackRefs = suttaDb[colRef];
        return trackRefs;
    }
}
//# sourceMappingURL=sutta-db.js.map