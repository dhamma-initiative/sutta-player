import { AudioStorageQueryable } from '../models/audio-storage-queryable.js'
import { SuttaPlayerState } from '../models/sutta-player-state.js'
import { SuttaStorageQueryable } from "../models/sutta-storage-queryable.js"

export class SuttaPlayerView {
    collectionElem: HTMLSelectElement
    suttaElem: HTMLSelectElement
    loadAudioElem: HTMLButtonElement
    loadTextElem: HTMLButtonElement
    playingSuttaElem: HTMLElement
    autoPlayElem: HTMLInputElement
    playNextElem: HTMLInputElement
    repeatElem: HTMLInputElement
    linkTextToAudioElem: HTMLInputElement
    audioPlayerElem: HTMLAudioElement
    suttaSummaryReferenceElem: HTMLElement
    suttaTextBodyElem: HTMLDivElement
    aboutSummaryReferenceElem: HTMLElement
    aboutTextBodyElem: HTMLDivElement

    private _playerState: SuttaPlayerState
    private _suttaStore: SuttaStorageQueryable
    private _audioStore: AudioStorageQueryable

    constructor(mdl: SuttaPlayerState, store: SuttaStorageQueryable, audResolver: AudioStorageQueryable) {
        this._playerState = mdl
        this._suttaStore = store
        this._audioStore = audResolver

        this._bindHtmlElements()
    }

    public async initialise() {
        this._loadCollectionsList()
        this.loadSuttasList()
        await this.loadSuttaText()
        this.refreshAudioControls()
        this.loadSuttaAudio()
    }

    public refreshAudioControls() {
        this.autoPlayElem.checked = this._playerState.autoPlay
        this.audioPlayerElem.autoplay = this._playerState.autoPlay
        this.playNextElem.checked = this._playerState.playNext
        this.repeatElem.checked = this._playerState.repeat
        this.linkTextToAudioElem.checked = this._playerState.linkTextToAudio
        this.audioPlayerElem.loop = this._playerState.repeat
    }

    public loadSuttasList() {
        const suttaLov = this._suttaStore.querySuttaReferences(this._playerState.navSel.collectionIndex)
        this.suttaElem.selectedIndex = -1
        this.suttaElem.innerHTML = ''
        for (let i = 0; i < suttaLov.length; i++) {
            let option = document.createElement('option')
            option.value = `${i}`
            if (i === this._playerState.navSel.suttaIndex)
                option.selected = true
            option.innerText = suttaLov[i]
            this.suttaElem.append(option)
        }
    }

    public async loadSuttaText() {
        if (this._playerState.textSel.baseRef === null) 
            return
        const textBody = await this._suttaStore.querySuttaText(this._playerState.textSel.baseRef)
        this.suttaSummaryReferenceElem.innerHTML = `&#128083; ${this._playerState.textSel.baseRef}`
        this.suttaTextBodyElem.innerHTML = textBody
    }

    public loadSuttaAudio() {
        if (this._playerState.audioSel.baseRef === null) 
            return
        const srcRef = this._audioStore.queryHtmlAudioSrcRef(this._playerState.audioSel.baseRef)
        this.audioPlayerElem.src = srcRef
        this.audioPlayerElem.currentTime = this._playerState.currentTime
    }

    public updatePlayingSuttaInfo(baseRef: string, status: string) {
        let info = status ? ` [${status}]` : ''
        this.playingSuttaElem.innerHTML = `&#127911; ${baseRef}${info}`
    }

    public async toggleAboutInfo() {
        if (this.aboutTextBodyElem.innerHTML.trim() === '') {
            const textBody = await this._suttaStore.readTextFile('./README.md')
            this.aboutTextBodyElem.innerHTML = textBody + 'suttaplayer@gmail.com'
        } else
            this.aboutTextBodyElem.innerHTML = ''
    }

    private _loadCollectionsList() {
        const colLov = this._suttaStore.queryCollectionNames() 
        for (let i = 0; i < colLov.length; i++) {
            let option = document.createElement('option')
            option.value = `${i}`
            if (i === this._playerState.navSel.collectionIndex)
                option.selected = true
            option.innerText = colLov[i]
            this.collectionElem.append(option)
        }
    }

    private _bindHtmlElements() {
        this.collectionElem = <HTMLSelectElement> document.getElementById('collection')
        this.suttaElem = <HTMLSelectElement> document.getElementById('sutta')
        this.loadAudioElem = <HTMLButtonElement> document.getElementById('loadAudio')
        this.loadTextElem = <HTMLButtonElement> document.getElementById('loadText')
        this.playingSuttaElem = <HTMLElement> document.getElementById('playingSutta')
        this.autoPlayElem = <HTMLInputElement> document.getElementById('autoPlay')
        this.playNextElem = <HTMLInputElement> document.getElementById('playNext')
        this.repeatElem = <HTMLInputElement> document.getElementById('repeat')
        this.linkTextToAudioElem = <HTMLInputElement> document.getElementById('linkTextToAudio')
        this.audioPlayerElem = <HTMLAudioElement> document.getElementById('audioPlayer')
        this.suttaSummaryReferenceElem = <HTMLElement> document.getElementById('suttaSummaryReference')
        this.suttaTextBodyElem = <HTMLDivElement> document.getElementById('suttaTextBody')
        this.aboutSummaryReferenceElem = <HTMLElement> document.getElementById('aboutSummaryReference')
        this.aboutTextBodyElem = <HTMLDivElement> document.getElementById('aboutTextBody')
    }
} 