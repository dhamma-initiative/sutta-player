import suttaDb from './sutta-db.json' assert { type: 'json' };
export function createSuttaStorageQueryable() {
    return new JsonFsSuttaDB();
}
export class JsonFsSuttaDB {
    queryCollectionNames() {
        return suttaDb.collectionName;
    }
    queryCollectionReferences() {
        return suttaDb.collectionBaseDirectory;
    }
    querySuttaReferences(colIdx) {
        colIdx = colIdx === -1 ? 0 : colIdx;
        const key = suttaDb.collectionBaseDirectory[colIdx];
        return this._querySuttaReferences(key);
    }
    querySuttaBaseReference(colIdx, suttaIdx) {
        if (colIdx === -1 || suttaIdx === -1)
            return null;
        const basePath = this.queryCollectionReferences()[colIdx];
        const baseName = this.querySuttaReferences(colIdx)[suttaIdx];
        const ret = `${basePath}/${baseName}`;
        return ret;
    }
    async querySuttaText(baseRef) {
        const relPath = `./text/suttas/${baseRef}.txt`;
        const ret = this.readTextFile(relPath);
        return ret;
    }
    async readTextFile(relPath) {
        const resp = await fetch(relPath);
        const text = await resp.text();
        return text;
    }
    _querySuttaReferences(colRef) {
        const suttaRefs = suttaDb[colRef];
        return suttaRefs;
    }
}
//# sourceMappingURL=sutta-db.js.map