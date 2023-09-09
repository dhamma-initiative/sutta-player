import { TrackSelection } from '../sutta-player-state.js'
import { SuttaStorageQueryable } from '../sutta-storage-queryable.js'
import suttaDb from './sutta-db.json' assert { type: 'json' }

export async function createSuttaStorageQueryable(): Promise<SuttaStorageQueryable> {
    const ret = new JsonFsSuttaDB()
    return ret
}

export class JsonFsSuttaDB implements SuttaStorageQueryable {
    public queryAlbumNames(): string[] {
        return suttaDb.albumName
    }

    public queryAlbumReferences(): string[] {
        return suttaDb.albumBaseDirectory
    }

    public queryTrackReferences(albIdx: number): string[] {
        albIdx = albIdx === -1 ? 0 : albIdx
        const key = suttaDb.albumBaseDirectory[albIdx]
        return this._queryTrackReferences(key)
    }

    public queryTrackBaseRef(albIdx: number, trackIdx: number): string {
        if (albIdx === -1 || trackIdx === -1)
            return null
        const basePath = this.queryAlbumReferences()[albIdx]
        const baseName = this.queryTrackReferences(albIdx)[trackIdx]
        const ret = `${basePath}/${baseName}`
        return ret
    }

    public queryTrackSelection(baseRef: string): TrackSelection {
        const baseName = baseRef.replace(/^.*[\\\/]/, '')
        let basePath = baseRef.substring(0, baseRef.length - baseName.length)
        if (basePath.startsWith('/'))
            basePath = basePath.substring(1)
        if (basePath.endsWith('/'))
            basePath = basePath.substring(0, basePath.length-1)
        const albIdx = suttaDb.albumBaseDirectory.indexOf(basePath)
        const lov = this._queryTrackReferences(basePath)
        const trkIdx = lov.indexOf(baseName)
        const ret = new TrackSelection('url', albIdx, trkIdx, baseRef)
        return ret
    }

    public async queryTrackText(baseRef: string): Promise<string> {
        const relPath = this.queryTrackTextUri(baseRef)
        const ret = await this.readTextFile(relPath)
        return ret
    }

    public queryTrackTextUri(baseRef: string): string {
        const relPath = `./text/suttas/${baseRef}.txt`
        return relPath
    }

    public async readTextFile(relPath: string): Promise<string> {
        const resp = await fetch(relPath)
        const text = await resp.text()
        return text
    }

    protected _queryTrackReferences(colRef: string): string[] {
        const trackRefs = suttaDb[colRef as keyof typeof suttaDb]
        return trackRefs
    }
}
