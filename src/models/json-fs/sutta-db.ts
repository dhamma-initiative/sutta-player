import { SuttaStorageQueryable } from '../sutta-storage-queryable.js'
import suttaDb from './sutta-db.json' assert { type: 'json' }


export function createSuttaStorageQueryable(): SuttaStorageQueryable {
    return new JsonFsSuttaDB()
}

export class JsonFsSuttaDB implements SuttaStorageQueryable {
    public queryCollectionNames(): string[] {
        return suttaDb.collectionName
    }

    public queryCollectionReferences(): string[] {
        return suttaDb.collectionBaseDirectory
    }

    public querySuttaReferences(colIdx: number): string[] {
        colIdx = colIdx === -1 ? 0 : colIdx
        const key = suttaDb.collectionBaseDirectory[colIdx]
        return this._querySuttaReferences(key)
    }

    public querySuttaBaseReference(colIdx: number, suttaIdx: number): string {
        if (colIdx === -1 || suttaIdx === -1)
            return null
        const basePath = this.queryCollectionReferences()[colIdx]
        const baseName = this.querySuttaReferences(colIdx)[suttaIdx]
        const ret = `${basePath}/${baseName}`
        return ret
    }

    public async querySuttaText(baseRef: string): Promise<string> {
        const relPath = this.querySuttaTextUri(baseRef)
        const ret = await this.readTextFile(relPath)
        return ret
    }

    public querySuttaTextUri(baseRef: string): string {
        const relPath = `./text/suttas/${baseRef}.txt`
        return relPath
    }

    public async readTextFile(relPath: string): Promise<string> {
        const resp = await fetch(relPath)
        const text = await resp.text()
        return text
    }

    protected _querySuttaReferences(colRef: string): string[] {
        const suttaRefs = suttaDb[colRef as keyof typeof suttaDb]
        return suttaRefs
    }
}
