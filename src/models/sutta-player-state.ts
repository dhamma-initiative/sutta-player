import { LocalStorageState } from '../runtime/localstorage-state.js'
import { SuttaStorageQueryable } from './sutta-storage-queryable.js'

export class TrackSelection extends LocalStorageState {
    context: string
    albumIndex: number
    trackIndex: number
    baseRef: string
    dictionary: any = {}
    isLoaded: boolean = false   // transient

    constructor(ctx: string, albIdx = 0, trkIdx = 0, bRef: string = null) {
        super()
        this.context = ctx
        this.albumIndex = albIdx
        this.trackIndex = trkIdx
        this.baseRef = bRef
    }

    public read(src: TrackSelection) {
        this.albumIndex = src.albumIndex
        this.trackIndex = src.trackIndex
        this.baseRef = src.baseRef
        this.isLoaded = false
    }

    public updateBaseRef(qry: SuttaStorageQueryable) {
        this.baseRef = qry.queryTrackBaseRef(this.albumIndex, this.trackIndex)
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

    public save() {
        this._setItemNumber(`${this.context}.albumIndex`, this.albumIndex)
        this._setItemNumber(`${this.context}.trackIndex`, this.trackIndex)
        this._setItemString(`${this.context}.baseRef`, this.baseRef)
    }

    public restore() {
        this.albumIndex = this._getItemNumber(`${this.context}.albumIndex`, this.albumIndex)
        this.trackIndex = this._getItemNumber(`${this.context}.trackIndex`, this.trackIndex)
        this.baseRef = this._getItemString(`${this.context}.baseRef`, this.baseRef)
    }
}

export class SuttaPlayerState extends LocalStorageState {
    navSel: TrackSelection = new TrackSelection('navSel')
    textSel: TrackSelection = new TrackSelection('textSel')
    audioSel: TrackSelection = new TrackSelection('audioSel')
    downloadedAlbums: number[] = []
    autoPlay: boolean = true
    playNext: boolean = true
    repeat: boolean = false
    linkTextToAudio: boolean = true
    showLineNums: boolean = true
    currentScrollY: number = 0
    currentTime: number = 0
    darkTheme: boolean = false

    searchFor: string = ''
    searchAlbums: number = 0
    useRegEx: boolean = false
    ignoreDiacritics: boolean = true

    audioState: number = -1 // transient [unspecified: -1, specified: 0, assigned: 1, loadedMetadata: 2, loaded: 3, playing: 4, paused: 5, ended: 6]
    stopDwnlDel: number = 0 // transient
    bookmarkLineRef: string = '' // transient

    startSearch: boolean = false // transient
    scrollTextWithAudio: boolean = false // transient

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
        const downloads = JSON.stringify(this.downloadedAlbums)
        this._setItemString('downloadedAlbums', downloads)

        this._setItemString('searchFor', this.searchFor)
        this._setItemNumber('searchAlbums', this.searchAlbums)
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
        const downloads = this._getItemString('downloadedAlbums', JSON.stringify(this.downloadedAlbums))
        this.downloadedAlbums = JSON.parse(downloads)

        this.searchFor = this._getItemString('searchFor', this.searchFor)
        this.searchAlbums = this._getItemNumber('searchAlbums', this.searchAlbums)
        this.useRegEx = this._getItemBoolean('useRegEx', this.useRegEx)
        this.ignoreDiacritics = this._getItemBoolean('ignoreDiacritics', this.ignoreDiacritics)
    }

    public isAlbumDownloaded(albumIndex: number): boolean {
        const ret = (this.downloadedAlbums.indexOf(albumIndex) > -1)
        return ret
    }

    public static toLineRef(lineNum: number, begIdxPos: number, begPerc: number, endIdxPos: number, endPerc: number): string {
        return `${lineNum}:${begIdxPos}:${begPerc.toFixed(3)}:${endIdxPos}:${endPerc.toFixed(3)}`
    }

    public static toLineRefUsingArr(refArr: number[]) {
        const ret = SuttaPlayerState.toLineRef(refArr[0], refArr[1], refArr[2], refArr[3], refArr[4])
        return ret
    }

    public static fromLineRef(lineRef: string): number[] {
        const vals = lineRef.split(':')
        return [Number(vals[0]), Number(vals[1]), Number(vals[2]), Number(vals[3]), Number(vals[4])]
    }
}