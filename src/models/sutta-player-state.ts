import { LocalStorageState } from './local-storage-state.js'
import { SuttaStorageQueryable } from './sutta-storage-queryable.js'

export class SuttaSelection extends LocalStorageState {
    context: string
    collectionIndex: number = 0
    suttaIndex: number = -1
    baseRef: string = null

    constructor(ctx: string) {
        super()
        this.context = ctx
    }

    public read(src: SuttaSelection) {
        this.collectionIndex = src.collectionIndex
        this.suttaIndex = src.suttaIndex
        this.baseRef = src.baseRef
    }

    public updateBaseRef(qry: SuttaStorageQueryable) {
        this.baseRef = qry.querySuttaBaseReference(this.collectionIndex, this.suttaIndex)
    }

    public save() {
        this._setItemNumber(`${this.context}.collectionIndex`, this.collectionIndex)
        this._setItemNumber(`${this.context}.suttaIndex`, this.suttaIndex)
        this._setItemString(`${this.context}.baseRef`, this.baseRef)
    }

    public load() {
        this.collectionIndex = this._getItemNumber(`${this.context}.collectionIndex`, this.collectionIndex)
        this.suttaIndex = this._getItemNumber(`${this.context}.suttaIndex`, this.suttaIndex)
        this.baseRef = this._getItemString(`${this.context}.baseRef`, this.baseRef)
    }
}

export class SuttaPlayerState extends LocalStorageState {
    navSel: SuttaSelection = new SuttaSelection('navSel')
    textSel: SuttaSelection = new SuttaSelection('textSel')
    audioSel: SuttaSelection = new SuttaSelection('audioSel')
    autoPlay: boolean = false
    playNext: boolean = false
    repeat: boolean = false
    linkTextToAudio: boolean = true
    currentTime: number = 0

    public save() {
        this.navSel.save()
        this.textSel.save()
        this.audioSel.save()
        this._setItemBoolean('autoPlay', this.autoPlay)
        this._setItemBoolean('playNext', this.playNext)
        this._setItemBoolean('repeat', this.repeat)
        this._setItemBoolean('linkTextToAudio', this.linkTextToAudio)
        this._setItemNumber('currentTime', this.currentTime)
    }

    public load() {
        this.navSel.load()
        this.textSel.load()
        this.audioSel.load()
        this.autoPlay = this._getItemBoolean('autoPlay', this.autoPlay)
        this.playNext = this._getItemBoolean('playNext', this.playNext)
        this.repeat = this._getItemBoolean('repeat', this.repeat)
        this.linkTextToAudio = this._getItemBoolean('linkTextToAudio', this.linkTextToAudio)
        this.currentTime = this._getItemNumber('currentTime', this.currentTime)
    }
}