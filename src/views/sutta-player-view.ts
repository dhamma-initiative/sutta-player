import { AudioStorageQueryable } from '../models/audio-storage-queryable.js'
import { SuttaPlayerState, SuttaSelection } from '../models/sutta-player-state.js'
import { SuttaStorageQueryable } from "../models/sutta-storage-queryable.js"

export class SuttaPlayerView {
    // settings
    autoPlayElem: HTMLInputElement
    playNextElem: HTMLInputElement
    repeatElem: HTMLInputElement
    linkTextToAudioElem: HTMLInputElement
    toggleDownloadElem: HTMLInputElement
    downloadProgressElem: HTMLProgressElement
    audioCacherElem: HTMLAudioElement
    resetAppElem: HTMLAnchorElement

    // about
    showAboutElem: HTMLAnchorElement
    aboutDialogElem: HTMLDialogElement
    aboutDialogCloseElem: HTMLAnchorElement
    aboutTextBodyElem: HTMLParagraphElement

    // selections
    collectionElem: HTMLSelectElement
    suttaElem: HTMLSelectElement
    loadAudioElem: HTMLButtonElement
    loadTextElem: HTMLButtonElement
    loadRandomElem: HTMLButtonElement

    // display
    playingSuttaElem: HTMLElement
    audioPlayerElem: HTMLAudioElement
    displayingSuttaElem: HTMLElement
    suttaTextBodyElem: HTMLDivElement

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
        this.downloadProgressElem.value = 0
        this.toggleDownloadElem.checked = this._playerState.isDownloading
    }

    public loadSuttasList() {
        const suttaLov = this._suttaStore.querySuttaReferences(this._playerState.navSel.collectionIndex)
        this.suttaElem.innerHTML = ''
        for (let i = 0; i < suttaLov.length; i++) {
            let option = document.createElement('option')
            option.value = `${i}`
            option.innerText = suttaLov[i]
            this.suttaElem.append(option)
        }
        this.suttaElem.selectedIndex = this._playerState.navSel.suttaIndex
    }

    public async loadSuttaText() {
        if (this._playerState.textSel.baseRef === null) 
            return
        const textBody = await this._suttaStore.querySuttaText(this._playerState.textSel.baseRef)
        this.suttaTextBodyElem.innerHTML = textBody
        this.displayingSuttaElem.innerHTML = `&#128083; ${this._playerState.textSel.baseRef}`
    }

    public loadSuttaAudio() {
        const success = this.loadSuttaAudioWith(this._playerState.audioSel, this.audioPlayerElem)
        if (success)
            this.audioPlayerElem.currentTime = this._playerState.currentTime
    }

    public loadSuttaAudioWith(suttaSel: SuttaSelection, viewAudio: HTMLAudioElement): boolean {
        if (suttaSel.baseRef === null)
            return false
        const srcRef = this._audioStore.queryHtmlAudioSrcRef(suttaSel.baseRef)
        viewAudio.src = srcRef
        return true
    }

    public updatePlayingSuttaInfo(baseRef: string, status: string) {
        let info = status ? ` [${status}]` : ''
        this.playingSuttaElem.innerHTML = `&#127911; ${baseRef}${info}`
    }

    public async toggleAboutInfo(event: any) {
        let isOpen = false
        if (this.aboutTextBodyElem.innerHTML.trim() === '') {
            isOpen = true
            let textBody = await this._suttaStore.readTextFile('./README.md')
            textBody = textBody.replaceAll('###', '-')
            textBody = textBody.replaceAll('#', '')
            this.aboutTextBodyElem.innerHTML = textBody + 'suttaplayer@gmail.com'
        } else
            this.aboutTextBodyElem.innerHTML = ''
        this.aboutDialogElem.open = isOpen
        event.preventDefault()
    }

    private _loadCollectionsList() {
        const colLov = this._suttaStore.queryCollectionNames() 
        for (let i = 0; i < colLov.length; i++) {
            let option = document.createElement('option')
            option.value = `${i}`
            option.innerText = colLov[i]
            this.collectionElem.append(option)
        }
        this.collectionElem.selectedIndex = this._playerState.navSel.collectionIndex
    }

    private _bindHtmlElements() {
        this.autoPlayElem = <HTMLInputElement> document.getElementById('autoPlay')
        this.playNextElem = <HTMLInputElement> document.getElementById('playNext')
        this.repeatElem = <HTMLInputElement> document.getElementById('repeat')
        this.linkTextToAudioElem = <HTMLInputElement> document.getElementById('linkTextToAudio')
        this.toggleDownloadElem = <HTMLInputElement> document.getElementById('toggleDownload')
        this.downloadProgressElem = <HTMLProgressElement> document.getElementById('downloadProgress')
        this.audioCacherElem = <HTMLAudioElement> document.getElementById('audioCacher')
        this.resetAppElem = <HTMLAnchorElement> document.getElementById('resetApp')

        this.showAboutElem = <HTMLAnchorElement> document.getElementById('showAbout')
        this.aboutDialogElem = <HTMLDialogElement> document.getElementById('aboutDialog')
        this.aboutDialogCloseElem = <HTMLAnchorElement> document.getElementById('aboutDialogClose')
        this.aboutTextBodyElem = <HTMLDivElement> document.getElementById('aboutTextBody')

        this.collectionElem = <HTMLSelectElement> document.getElementById('collection')
        this.suttaElem = <HTMLSelectElement> document.getElementById('sutta')
        this.loadAudioElem = <HTMLButtonElement> document.getElementById('loadAudio')
        this.loadTextElem = <HTMLButtonElement> document.getElementById('loadText')
        this.loadRandomElem = <HTMLButtonElement> document.getElementById('loadRandom')

        this.playingSuttaElem = <HTMLElement> document.getElementById('playingSutta')
        this.audioPlayerElem = <HTMLAudioElement> document.getElementById('audioPlayer')
        this.displayingSuttaElem = <HTMLElement> document.getElementById('displayingSutta')
        this.suttaTextBodyElem = <HTMLDivElement> document.getElementById('suttaTextBody')
    }
} 