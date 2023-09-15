import { LocalStorageState } from '../runtime/localstorage-state.js'
import { AlbumStorageQueryable } from './album-storage-queryable.js'

export class TrackSelection extends LocalStorageState {
    context: string
    albumIndex: number
    trackIndex: number
    baseRef: string
    dictionary: any = {}
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
        this.isLoaded = false
        return ret
    }

    public updateBaseRef(qry: AlbumStorageQueryable) {
        this.baseRef = qry.queryTrackBaseRef(this.albumIndex, this.trackIndex)
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
    }

    public save() {
        this._setItemNumber(`${this.context}.albumIndex`, this.albumIndex)
        this._setItemNumber(`${this.context}.trackIndex`, this.trackIndex)
        this._setItemString(`${this.context}.baseRef`, this.baseRef)
    }

    public restore() {
        this.albumIndex = this._getItemNumber(`${this.context}.albumIndex`, this.albumIndex)
        this.trackIndex = this._getItemNumber(`${this.context}.trackIndex`, this.trackIndex)
        this.baseRef = this._getItemString(`${this.context}.baseRef`, this.baseRef)
        this._refreshDictionary()
    }

    private _refreshDictionary() {
        if (this.baseRef !== null) {
            const idxPos = this.baseRef.lastIndexOf('/')
            if (idxPos > -1)
                this.dictionary['albumRef'] = this.baseRef.substring(0, idxPos)            
            else
                this.dictionary['albumRef'] = this.baseRef        
        }
    }
}

export class BookmarkedSelection extends TrackSelection {
    public static CONTEXT = 'url'
    public static ONLOAD = 'onload_url'
    public static AWAITING_AUDIO_END = 'awaiting_audio_end'
    public static BUILD = 'build'

    appRoot: string
    startTime: number
    endTime: number
    lineRef: string

    constructor(root: string = '/', ctx: string = BookmarkedSelection.CONTEXT, albIdx = 0, trkIdx = 0, bRef: string = null) {
        super(ctx, albIdx, trkIdx, bRef)
        this.appRoot = root
        this.reset(ctx, albIdx, trkIdx, bRef)
    }

    public read(src: TrackSelection):boolean {
        let ret = super.read(src)
        if (ret) {
            this.startTime = -1
            this.endTime = -1
            this.lineRef = null
        }
        return ret
    }

    public reset(ctx: string = BookmarkedSelection.CONTEXT, albIdx = 0, trkIdx = 0, bRef: string = null) {
        super.reset(ctx, albIdx, trkIdx, bRef)
        this.startTime = -1
        this.endTime = -1
        this.lineRef = null
    }

    public set(st?: number, et?: number, lr?: string) {
        this.context = BookmarkedSelection.CONTEXT
        if (st !== null)
            this.startTime = st
        if (et !== null)
            this.endTime = et
        if (lr !== null)
            this.lineRef = lr
    }

    public createLink(): string {
        let ret = location.protocol + '//' + location.host + this.appRoot + '#' + this.baseRef + '?'
        if (this.startTime > -1)
            ret += `startTime=${this.startTime}`
        if (this.endTime > -1) {
            const amp = ret.endsWith('?') ? '' : '&'
            ret += `${amp}endTime=${this.endTime}`
        }
        if (this.lineRef !== null) {
            const amp = ret.endsWith('?') ? '' : '&'
            ret += `${amp}lineRef=${this.lineRef}`
        }
        return ret
    }

    public parseLink(qry: AlbumStorageQueryable) {
        let href = location.href
        let url = new URL(href)
        if (url.hash) {
            href = href.replace('#','')
            url = new URL(href)
           let baseRef = url.pathname.substring(this.appRoot.length)
            if (baseRef.startsWith('/'))
                baseRef = baseRef.substring(1)
            const urlSel = qry.queryTrackSelection(baseRef)
            if (urlSel.albumIndex > -1 && urlSel.trackIndex > -1) {
                this.read(urlSel)
                const st = url.searchParams.get('startTime')
                const et = url.searchParams.get('endTime')
                const lr = url.searchParams.get('lineRef')
                this.set(st !== null ? Number(st): null, et !== null ? Number(et): null, lr)
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

export class AlbumPlayerState extends LocalStorageState {
    navSel: TrackSelection = new TrackSelection('navSel')
    textSel: TrackSelection = new TrackSelection('textSel')
    audioSel: TrackSelection = new TrackSelection('audioSel')
    autoPlay: boolean = true
    playNext: boolean = true
    repeat: boolean = false
    linkTextToAudio: boolean = true
    showLineNums: boolean = true
    currentScrollY: number = 0
    currentTime: number = 0
    darkTheme: boolean = false
    showContextControls: boolean = false

    searchFor: string = ''
    searchScope: number = 0 // [selected album: 0, cached tracks: 1, all albums: 2]
    useRegEx: boolean = false
    ignoreDiacritics: boolean = true

    audioState: number = -1 // transient [unspecified: -1, specified: 0, assigned: 1, loadedMetadata: 2, loaded: 3, playing: 4, paused: 5, ended: 6]
    stopDwnlDel: number = 0 // transient
    bookmarkSel: BookmarkedSelection // transient

    startSearch: boolean = false // transient
    scrollTextWithAudio: boolean = false // transient

    constructor(bmSel: BookmarkedSelection) {
        super()
        this.bookmarkSel = bmSel
    }

    public save() {
        this.navSel.save()
        this.textSel.save()
        this.audioSel.save()
        this._setItemBoolean('autoPlay', this.autoPlay)
        this._setItemBoolean('playNext', this.playNext)
        this._setItemBoolean('repeat', this.repeat)
        this._setItemBoolean('linkTextToAudio', this.linkTextToAudio)
        this._setItemBoolean('showLineNums', this.showLineNums)
        this._setItemNumber('currentScrollY', window.scrollY)
        this._setItemNumber('currentTime', this.currentTime)
        this._setItemBoolean('darkTheme', this.darkTheme)
        this._setItemBoolean('showContextControls', this.showContextControls)

        this._setItemString('searchFor', this.searchFor)
        this._setItemNumber('searchScope', this.searchScope)
        this._setItemBoolean('useRegEx', this.useRegEx)
        this._setItemBoolean('ignoreDiacritics', this.ignoreDiacritics)
    }

    public restore() {
        this.navSel.restore()
        this.textSel.restore()
        this.audioSel.restore()
        this.autoPlay = this._getItemBoolean('autoPlay', this.autoPlay)
        this.playNext = this._getItemBoolean('playNext', this.playNext)
        this.repeat = this._getItemBoolean('repeat', this.repeat)
        this.linkTextToAudio = this._getItemBoolean('linkTextToAudio', this.linkTextToAudio)
        this.showLineNums = this._getItemBoolean('showLineNums', this.showLineNums)
        this.currentTime = this._getItemNumber('currentTime', this.currentTime)
        this.currentScrollY = this._getItemNumber('currentScrollY', this.currentScrollY)
        this.darkTheme = this._getItemBoolean('darkTheme', this.darkTheme)
        this.showContextControls = this._getItemBoolean('showContextControls', this.showContextControls)

        this.searchFor = this._getItemString('searchFor', this.searchFor)
        this.searchScope = this._getItemNumber('searchScope', this.searchScope)
        this.useRegEx = this._getItemBoolean('useRegEx', this.useRegEx)
        this.ignoreDiacritics = this._getItemBoolean('ignoreDiacritics', this.ignoreDiacritics)
    }

    public static toLineRef(lineNum: number, begIdxPos: number, begPerc: number, endIdxPos: number, endPerc: number): string {
        return `${lineNum}:${begIdxPos}:${begPerc.toFixed(3)}:${endIdxPos}:${endPerc.toFixed(3)}`
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