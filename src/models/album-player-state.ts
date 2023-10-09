import { LocalStorageState } from '../runtime/localstorage-state.js'
import { AlbumStorageQueryable, QueryService } from './album-storage-queryable.js'

export class TrackSelection extends LocalStorageState {
    context: string
    albumIndex: number
    trackIndex: number
    baseRef: string
    startTime: number
    stopTime: number
    lineRef: string

    dictionary: any = {}        // transient
    isLoaded: boolean = false   // transient

    constructor(ctx: string, albIdx = 0, trkIdx = 0, bRef: string = null) {
        super()
        this.reset(ctx, albIdx, trkIdx, bRef)
    }

    public read(src: TrackSelection): boolean {
        let ret = false
        if (this.albumIndex !== src.albumIndex) {
            this.albumIndex = src.albumIndex
            ret = true
        }
        if (this.trackIndex !== src.trackIndex) {
            this.trackIndex = src.trackIndex
            ret = true
        }
        if (this.baseRef !== src.baseRef) {
            this.baseRef = src.baseRef
            this._refreshDictionary()
            ret = true
        }
        if (this.startTime !== src.startTime) {
            this.startTime = src.startTime
            ret = true
        }
        if (this.stopTime !== src.stopTime) {
            this.stopTime = src.stopTime
            ret = true
        }
        if (this.lineRef !== src.lineRef) {
            this.lineRef = src.lineRef
            ret = true
        }
        this.isLoaded = false
        return ret
    }

    public async updateBaseRef(qry: QueryService): Promise<void> {
        this.baseRef = await qry.queryTrackBaseRef(this.albumIndex, this.trackIndex)
        this._refreshDictionary()
    }

    public isSimilar(toChk: TrackSelection) {
        if (toChk.albumIndex !== this.albumIndex)
            return false
        if (toChk.trackIndex !== this.trackIndex)
            return false
        if (toChk.baseRef !== this.baseRef)
            return false
        return true
    }

    public reset(ctx: string = null, albIdx = 0, trkIdx = 0, bRef: string = null) {
        this.context = ctx
        this.albumIndex = albIdx
        this.trackIndex = trkIdx
        this.baseRef = bRef
        this.dictionary = {}
        this.isLoaded = false
        this._refreshDictionary()
    }

    public setDetails(lr?: string, st?: number, et?: number) {
        this.lineRef = lr
        if (st !== null)
            this.startTime = st
        if (et !== null)
            this.stopTime = et
    }

    protected _prepareSaveIntoJson(): any {
        let json: any = {albumIndex: this.albumIndex, trackIndex: this.trackIndex, baseRef: this.baseRef}
        if (this.lineRef)
            json = {...json, lineRef: this.lineRef}
        if (this.startTime !== null && this.startTime !== -1)
            json = {...json, startTime: this.startTime}
        
        if (this.stopTime !== null && this.stopTime !== -1)
            json = {...json, stopTime: this.stopTime}
        return json
    }

    public save() {
        const json = this._prepareSaveIntoJson()
        this._setItemJson(this.context, json)
    }

    protected _prepareRestoreFromJson(json: any) {
        const {source: source, albumIndex: albumIndex, trackIndex: trackIndex, baseRef: baseRef} = json
        if (albumIndex)
            this.albumIndex = albumIndex
        if (trackIndex)
            this.trackIndex = trackIndex
        if (baseRef)
            this.baseRef = baseRef
        const {lineRef: lineRef, startTime: startTime, stopTime: stopTime} = json
        if (lineRef)
            this.lineRef = lineRef
        if (startTime)
            this.startTime = startTime
        if (stopTime)
            this.stopTime = stopTime
    }

    public restore() {
        const json = this._getItemJson(this.context, {}) 
        this._prepareRestoreFromJson(json)
        this._refreshDictionary()
    }

    private _refreshDictionary() {
        if (this.baseRef !== null) {
            const idxPos = this.baseRef.lastIndexOf('/')
            if (idxPos > -1) {
                this.dictionary['albumRef'] = this.baseRef.substring(0, idxPos)
                this.dictionary['trackName'] = this.baseRef.substring(idxPos+1)
            } else {
                this.dictionary['albumRef'] = this.baseRef
                this.dictionary['trackName'] = ''
            }
        }
    }
}

export class BookmarkedSelection extends TrackSelection {
    public static CONTEXT = 'url'
    public static ONLOAD = 'onload_url'
    public static AWAITING_AUDIO_END = 'awaiting_audio_end'
    public static BUILD = 'build'

    appRoot: string

    constructor(root: string = '/', ctx: string = BookmarkedSelection.CONTEXT, albIdx = 0, trkIdx = 0, bRef: string = null) {
        super(ctx, albIdx, trkIdx, bRef)
        this.appRoot = root
        this.reset(ctx, albIdx, trkIdx, bRef)
    }

    public read(src: TrackSelection): boolean {
        this.startTime = -1
        this.stopTime = -1
        this.lineRef = null
        let ret = super.read(src)
        return ret
    }

    public reset(ctx: string = BookmarkedSelection.CONTEXT, albIdx = 0, trkIdx = 0, bRef: string = null) {
        super.reset(ctx, albIdx, trkIdx, bRef)
        this.setDetails(null, -1, -1)
    }

    public setDetails(lr?: string, st?: number, et?: number) {
        this.context = BookmarkedSelection.CONTEXT
        super.setDetails(lr, st, et)
    }

    public createLink(): string {
        let ret = location.protocol + '//' + location.host + this.appRoot + '#' + this.baseRef + '?'
        if (this.startTime > -1)
            ret += `startTime=${this.startTime}`
        if (this.stopTime > -1) {
            const amp = ret.endsWith('?') ? '' : '&'
            ret += `${amp}stopTime=${this.stopTime}`
        }
        if (this.lineRef !== null) {
            const amp = ret.endsWith('?') ? '' : '&'
            ret += `${amp}lineRef=${this.lineRef}`
        }
        return ret
    }

    public async parseLink(qry: AlbumStorageQueryable): Promise<void> {
        let href = location.href
        let url = new URL(href)
        if (url.hash) {
            href = href.replace('#','')
            url = new URL(href)
           let baseRef = url.pathname.substring(this.appRoot.length)
            if (baseRef.startsWith('/'))
                baseRef = baseRef.substring(1)
            const urlSel = await qry.queryTrackSelection(baseRef)
            if (urlSel.albumIndex > -1 && urlSel.trackIndex > -1) {
                this.read(urlSel)
                const st = url.searchParams.get('startTime')
                const et = url.searchParams.get('stopTime')
                const lr = url.searchParams.get('lineRef')
                this.setDetails(lr, st !== null ? Number(st): null, et !== null ? Number(et): null)
                this.context = BookmarkedSelection.ONLOAD
            }
        }
    }

    public isAwaitingLoad(): boolean {
        return this.context === BookmarkedSelection.ONLOAD
    }

    public isAwaitingAudioEnd(): boolean {
        return this.context === BookmarkedSelection.AWAITING_AUDIO_END
    }

    public cancelAwaitingAudioEndIfRqd() {
        if (this.isAwaitingAudioEnd())
            this.context = BookmarkedSelection.CONTEXT
    }
}

export interface PlaylistIterator {
    setContext(ctx: TrackSelection): Promise<void>
    size(): number
    hasPrev(): boolean
    hasNext(): boolean
    /* async */ prev(): Promise<TrackSelection>
    /* async */ next(): Promise<TrackSelection>
    current(): TrackSelection
}

export interface PlayListItemJson {
    baseRef: string
    lineRef: string
    startTime: number
    stopTime: number
    notes: string
}

export interface PlayListHeaderJson {
    id: string
    name: string
}

export interface PlayListJson {
    id: string
    list: PlayListItemJson[]
}

export type PlaylistTuple = {header: PlayListHeaderJson, list: PlayListJson}

export class AlbumPlayerState extends LocalStorageState {
    catSel: TrackSelection = new TrackSelection('catalogSel')
    playlistSel: TrackSelection = new TrackSelection('playlistSel')
    homeSel: TrackSelection = new TrackSelection('homeSel')
    playlists: PlayListHeaderJson[] = []
    currentPlaylist: PlayListJson

    autoPlay: boolean = true
    playNext: boolean = true
    repeat: boolean = false
    scrollTextWithAudio: boolean = false
    loadAudioWithText: boolean = true
    showLineNums: boolean = true
    currentScrollY: number = 0
    currentTime: number = 0
    darkTheme: boolean = false

    searchFor: string = ''
    searchScope: number = 0 // [selected album: 0, cached tracks: 1, all albums: 2]
    useRegEx: boolean = false
    applyAndBetweenTerms: boolean = true
    regExFlags: string = 'gm'
    ignoreDiacritics: boolean = true

    concurrencyCount: number = 0
    lastPlaylistIterator: string = null

    playlistIterator: PlaylistIterator
    stopDwnlDel: number = 0 // transient
    bookmarkSel: BookmarkedSelection // transient

    startSearch: boolean = false // transient

    private _audioState: number = -1 // transient [unspecified: -1, specified: 0, assigned: 1, loadedMetadata: 2, loaded: 3, playing: 4, paused: 5, ended: 6]
    onAudioStateChange: (oldVal: number, newVal: number) => void

    constructor(bmSel: BookmarkedSelection) {
        super()
        this.bookmarkSel = bmSel
    }

    public save() {
        this.catSel.save()
        this.homeSel.save()
        this.playlistSel.save()
        this._setItemBoolean('autoPlay', this.autoPlay)
        this._setItemBoolean('playNext', this.playNext)
        this._setItemBoolean('repeat', this.repeat)
        this._setItemBoolean('scrollTextWithAudio', this.scrollTextWithAudio)
        this._setItemBoolean('loadAudioWithText', this.loadAudioWithText)
        this._setItemBoolean('showLineNums', this.showLineNums)
        this._setItemNumber('currentScrollY', window.scrollY)
        this._setItemNumber('currentTime', this.currentTime)
        this._setItemBoolean('darkTheme', this.darkTheme)
        this._setItemNumber('concurrencyCount', this.concurrencyCount)
        this._setItemString('lastPlaylistIterator', this.lastPlaylistIterator)

        this._setItemString('searchFor', this.searchFor)
        this._setItemNumber('searchScope', this.searchScope)
        this._setItemBoolean('useRegEx', this.useRegEx)
        this._setItemString('regExFlags', this.regExFlags)
        this._setItemBoolean('applyAndBetweenTerms', this.applyAndBetweenTerms)
        this._setItemBoolean('ignoreDiacritics', this.ignoreDiacritics)

        this.playlists.sort((a, b) => a.name.localeCompare(b.name))
        this._setItemJson('playLists', this.playlists)
    }

    public restore() {
        this.catSel.restore()
        this.homeSel.restore()
        this.playlistSel.restore()
        this.autoPlay = this._getItemBoolean('autoPlay', this.autoPlay)
        this.playNext = this._getItemBoolean('playNext', this.playNext)
        this.repeat = this._getItemBoolean('repeat', this.repeat)
        this.scrollTextWithAudio = this._getItemBoolean('scrollTextWithAudio', this.scrollTextWithAudio)
        this.loadAudioWithText = this._getItemBoolean('loadAudioWithText', this.loadAudioWithText)
        this.showLineNums = this._getItemBoolean('showLineNums', this.showLineNums)
        this.currentTime = this._getItemNumber('currentTime', this.currentTime)
        this.currentScrollY = this._getItemNumber('currentScrollY', this.currentScrollY)
        this.darkTheme = this._getItemBoolean('darkTheme', this.darkTheme)
        this.concurrencyCount = this._getItemNumber('concurrencyCount', this.concurrencyCount)
        this.lastPlaylistIterator = this._getItemString('lastPlaylistIterator', this.lastPlaylistIterator)

        this.searchFor = this._getItemString('searchFor', this.searchFor)
        this.searchScope = this._getItemNumber('searchScope', this.searchScope)
        this.useRegEx = this._getItemBoolean('useRegEx', this.useRegEx)
        this.regExFlags = this._getItemString('regExFlags', this.regExFlags)
        this.applyAndBetweenTerms = this._getItemBoolean('applyAndBetweenTerms', this.applyAndBetweenTerms)
        this.ignoreDiacritics = this._getItemBoolean('ignoreDiacritics', this.ignoreDiacritics)

        this.playlists = this._getItemJson('playLists', this.playlists)
    }

    public setAudioState(val: number) {
        let oldVal = this._audioState
        this._audioState = val
        if (this.onAudioStateChange)
            this.onAudioStateChange(oldVal, val)
    }

    public getAudioState(): number {
        return this._audioState
    }

    public loadPlaylist(idx: number): PlaylistTuple {
        let ret: PlaylistTuple = {header: null, list: null}
        if (idx === -1 || this.playlists.length === 0) {
            ret.header = {
                id: crypto.randomUUID(),
                name: 'New Playlist',
            }
            ret.list = {
                id: ret.header.id,
                list: []
            }
            this.playlists.push(ret.header)
            this.savePlaylist(ret)
        } else {
            ret.header = this.playlists[idx]
            const plKey = `pl.${ret.header.id}`
            ret.list = this._getItemJson(plKey, {id: ret.header.id, list: []})
        } 
        return ret
    }

    public savePlaylist(plTuple: PlaylistTuple) {
        const plKey = `pl.${plTuple.list.id}`
        this._setItemJson(plKey, plTuple.list)
        this._setItemJson('playLists', this.playlists)
    }

    public static toLineRef(lineNum: number, begIdxPos: number, begPerc: number, endIdxPos?: number, endPerc?: number): string {
        let ret = `${lineNum}:${begIdxPos}:${begPerc.toFixed(3)}`
        if (endIdxPos && endPerc)
            ret += `:${endIdxPos}:${endPerc.toFixed(3)}`
        return ret
    }

    public static toLineRefUsingArr(refArr: number[]) {
        const ret = AlbumPlayerState.toLineRef(refArr[0], refArr[1], refArr[2], refArr[3], refArr[4])
        return ret
    }

    public static fromLineRef(lineRef: string): number[] {
        const vals = lineRef.split(':')
        return [Number(vals[0]), Number(vals[1]), Number(vals[2]), Number(vals[3]), Number(vals[4])]
    }
}