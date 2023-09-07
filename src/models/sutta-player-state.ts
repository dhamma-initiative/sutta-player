import { LocalStorageState } from '../runtime/localstorage-state.js'
import { SuttaStorageQueryable } from './sutta-storage-queryable.js'

export class TrackSelection extends LocalStorageState {
    context: string
    albumIndex: number
    trackIndex: number
    baseRef: string

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
    }

    public updateBaseRef(qry: SuttaStorageQueryable) {
        this.baseRef = qry.queryTrackBaseRef(this.albumIndex, this.trackIndex)
    }

    public save() {
        this._setItemNumber(`${this.context}.albumIndex`, this.albumIndex)
        this._setItemNumber(`${this.context}.trackIndex`, this.trackIndex)
        this._setItemString(`${this.context}.baseRef`, this.baseRef)
    }

    public load() {
        this.albumIndex = this._getItemNumber(`${this.context}.albumIndex`, this.albumIndex)
        this.trackIndex = this._getItemNumber(`${this.context}.trackIndex`, this.trackIndex)
        this.baseRef = this._getItemString(`${this.context}.baseRef`, this.baseRef)
    }
}

export class SuttaPlayerState extends LocalStorageState {
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

    searchFor: string = ''
    searchAllAlbums: boolean = false
    useRegEx: boolean = false
    ignoreDiacritics: boolean = true

    audioState: number = -1 // transient [unspecified: -1, specified: 0, assigned: 1, loadedMetadata: 2, loaded: 3, playing: 4, paused: 5, ended: 6]
    stopDwnlDel: number = 0 // transient
    bookmarkLineNum: number = 0 // trainsient
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

        this._setItemString('searchFor', this.searchFor)
        this._setItemBoolean('searchAllAlbums', this.searchAllAlbums)
        this._setItemBoolean('useRegEx', this.useRegEx)
        this._setItemBoolean('ignoreDiacritics', this.ignoreDiacritics)
    }

    public load() {
        this.navSel.load()
        this.textSel.load()
        this.audioSel.load()
        this.autoPlay = this._getItemBoolean('autoPlay', this.autoPlay)
        this.playNext = this._getItemBoolean('playNext', this.playNext)
        this.repeat = this._getItemBoolean('repeat', this.repeat)
        this.linkTextToAudio = this._getItemBoolean('linkTextToAudio', this.linkTextToAudio)
        this.showLineNums = this._getItemBoolean('showLineNums', this.showLineNums)
        this.currentTime = this._getItemNumber('currentTime', this.currentTime)
        this.currentScrollY = this._getItemNumber('currentScrollY', this.currentScrollY)
        this.darkTheme = this._getItemBoolean('darkTheme', this.darkTheme)

        this.searchFor = this._getItemString('searchFor', this.searchFor)
        this.searchAllAlbums = this._getItemBoolean('searchAllAlbums', this.searchAllAlbums)
        this.useRegEx = this._getItemBoolean('useRegEx', this.useRegEx)
        this.ignoreDiacritics = this._getItemBoolean('ignoreDiacritics', this.ignoreDiacritics)
    }
}