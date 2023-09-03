import { AudioStorageQueryable } from '../models/audio-storage-queryable.js'
import { SuttaPlayerState, TrackSelection } from '../models/sutta-player-state.js'
import { SuttaStorageQueryable } from "../models/sutta-storage-queryable.js"

export class SuttaPlayerView {
    // settings
    autoPlayElem: HTMLInputElement
    playNextElem: HTMLInputElement
    repeatElem: HTMLInputElement
    linkTextToAudioElem: HTMLInputElement
    offlineMenuElem: HTMLAnchorElement
    resetAppMenuElem: HTMLAnchorElement

    // about
    aboutMenuElem: HTMLAnchorElement
    aboutDialogElem: HTMLDialogElement
    aboutDialogCloseElem: HTMLAnchorElement
    aboutTextBodyElem: HTMLParagraphElement

    // selections
    albumTrackSelectionElem: HTMLDetailsElement
    albumElem: HTMLSelectElement
    trackElem: HTMLSelectElement
    loadAudioElem: HTMLButtonElement
    loadTextElem: HTMLButtonElement
    loadRandomElem: HTMLButtonElement
    shareLinkElem: HTMLButtonElement

    // display
    playingTrackElem: HTMLElement
    audioPlayerElem: HTMLAudioElement
    displayingTrackElem: HTMLElement
    trackTextBodyElem: HTMLDivElement

    // offline
    offlineDialogElem: HTMLDialogElement
    offlineDialogCloseElem: HTMLAnchorElement
    offlineTitleElem: HTMLElement
    downloadAlbumElem: HTMLInputElement
    deleteAlbumElem: HTMLInputElement
    stopProcessingElem: HTMLInputElement
    processingInfoElem: HTMLDivElement
    processingProgressElem: HTMLProgressElement
    audioCacherElem: HTMLAudioElement

    // reset app
    resetAppDialogElem: HTMLDialogElement
    resetAppCloseElem: HTMLAnchorElement
    resetAppConfirmElem: HTMLAnchorElement

    private _modelState: SuttaPlayerState
    private _suttaStore: SuttaStorageQueryable
    private _audioStore: AudioStorageQueryable

    constructor(mdl: SuttaPlayerState, store: SuttaStorageQueryable, audResolver: AudioStorageQueryable) {
        this._modelState = mdl
        this._suttaStore = store
        this._audioStore = audResolver

        this._bindHtmlElements()
    }

    public async initialise() {
        this._loadAlbumsList()
        this.loadTracksList()
        await this.loadTrackText()
        this.refreshAudioControls()
        this.loadTrackAudio()
    }

    public refreshAudioControls() {
        this.autoPlayElem.checked = this._modelState.autoPlay
        this.audioPlayerElem.autoplay = this._modelState.autoPlay
        this.playNextElem.checked = this._modelState.playNext
        this.repeatElem.checked = this._modelState.repeat
        this.linkTextToAudioElem.checked = this._modelState.linkTextToAudio
        this.audioPlayerElem.loop = this._modelState.repeat
        this.processingProgressElem.value = 0
        this.stopProcessingElem.checked = (this._modelState.stopDwnlDel === 0)
    }

    public loadTracksList() {
        const trackLov = this._suttaStore.queryTrackReferences(this._modelState.navSel.albumIndex)
        this.trackElem.innerHTML = ''
        for (let i = 0; i < trackLov.length; i++) {
            let option = document.createElement('option')
            option.value = `${i}`
            option.innerText = trackLov[i]
            this.trackElem.append(option)
        }
        this.trackElem.selectedIndex = this._modelState.navSel.trackIndex
    }

    public async loadTrackText() {
        if (this._modelState.textSel.baseRef === null) 
            return
        const textBody = await this._suttaStore.queryTrackText(this._modelState.textSel.baseRef)
        this.trackTextBodyElem.innerHTML = textBody
        this.displayingTrackElem.innerHTML = `&#128083; ${this._modelState.textSel.baseRef}`
    }

    public loadTrackAudio() {
        const success = this.loadSuttaAudioWith(this._modelState.audioSel, this.audioPlayerElem)
        if (success)
            this.audioPlayerElem.currentTime = this._modelState.currentTime
    }

    public loadSuttaAudioWith(trackSel: TrackSelection, viewAudio: HTMLAudioElement): boolean {
        if (trackSel.baseRef === null)
            return false
        const srcRef = this._audioStore.queryHtmlAudioSrcRef(trackSel.baseRef)
        viewAudio.src = srcRef
        return true
    }

    public updatePlayingTrackInfo(baseRef: string, status: string) {
        let info = status ? ` [${status}]` : ''
        this.playingTrackElem.innerHTML = `&#127911; ${baseRef}${info}`
    }

    public async toggleAboutInfo(event: any) {
        if (event)
            event.preventDefault()
        if (this.aboutTextBodyElem.innerHTML.trim() === '') {
            let textBody = await this._suttaStore.readTextFile('./README.md')
            textBody = textBody.replaceAll('###', '-')
            textBody = textBody.replaceAll('#', '')
            this.aboutTextBodyElem.innerHTML = textBody + 'suttaplayer@gmail.com'
        } else
            this.aboutTextBodyElem.innerHTML = ''
        this.aboutDialogElem.open = !this.aboutDialogElem.open
    }

    public toggleOfflineDialog(event: any) {
        if (event)
            event.preventDefault()
        this.offlineDialogElem.open = !this.offlineDialogElem.open
        if (!this.offlineDialogElem.open)
            return
        if (this._modelState.stopDwnlDel === 0) {
            let albumName = this.albumElem.children[this.albumElem.selectedIndex].innerHTML
            this.offlineTitleElem.innerHTML = albumName
        }
    }

    public toggleResetAppDialog(event: any) {
        if (event)
            event.preventDefault()
        this.resetAppDialogElem.open = !this.resetAppDialogElem.open
    }

    public updateOfflineInfo(processingInfo: string, perc: number) {
        let actn = 'Choose an action above'
        let disableActivityActions = true
        if (this._modelState.stopDwnlDel === 1)
            actn = 'Downloading'
        else if (this._modelState.stopDwnlDel === 2)
            actn = 'Deleting'
        else if (this._modelState.stopDwnlDel === 0 && processingInfo === '' && perc === 0)
            disableActivityActions = false
        this.processingInfoElem.innerHTML = `${actn} ${processingInfo}`
        this.processingProgressElem.value = perc
        this.downloadAlbumElem.disabled = disableActivityActions
        this.deleteAlbumElem.disabled = disableActivityActions
    }

    private _loadAlbumsList() {
        const colLov = this._suttaStore.queryAlbumNames() 
        for (let i = 0; i < colLov.length; i++) {
            let option = document.createElement('option')
            option.value = `${i}`
            option.innerText = colLov[i]
            this.albumElem.append(option)
        }
        this.albumElem.selectedIndex = this._modelState.navSel.albumIndex
    }

    private _bindHtmlElements() {
        this.autoPlayElem = <HTMLInputElement> document.getElementById('autoPlay')
        this.playNextElem = <HTMLInputElement> document.getElementById('playNext')
        this.repeatElem = <HTMLInputElement> document.getElementById('repeat')
        this.linkTextToAudioElem = <HTMLInputElement> document.getElementById('linkTextToAudio')
        this.offlineMenuElem = <HTMLAnchorElement> document.getElementById('offlineMenu')
        this.resetAppMenuElem = <HTMLAnchorElement> document.getElementById('resetAppMenu')

        this.aboutMenuElem = <HTMLAnchorElement> document.getElementById('aboutMenu')
        this.aboutDialogElem = <HTMLDialogElement> document.getElementById('aboutDialog')
        this.aboutDialogCloseElem = <HTMLAnchorElement> document.getElementById('aboutDialogClose')
        this.aboutTextBodyElem = <HTMLDivElement> document.getElementById('aboutTextBody')

        this.albumTrackSelectionElem = <HTMLDetailsElement> document.getElementById('albumTrackSelection')
        this.albumElem = <HTMLSelectElement> document.getElementById('album')
        this.trackElem = <HTMLSelectElement> document.getElementById('track')
        this.loadAudioElem = <HTMLButtonElement> document.getElementById('loadAudio')
        this.loadTextElem = <HTMLButtonElement> document.getElementById('loadText')
        this.loadRandomElem = <HTMLButtonElement> document.getElementById('loadRandom')
        this.shareLinkElem = <HTMLButtonElement> document.getElementById('shareLink')

        this.playingTrackElem = <HTMLElement> document.getElementById('playingTrack')
        this.audioPlayerElem = <HTMLAudioElement> document.getElementById('audioPlayer')
        this.displayingTrackElem = <HTMLElement> document.getElementById('displayingTrack')
        this.trackTextBodyElem = <HTMLDivElement> document.getElementById('trackTextBody')

        this.offlineDialogElem = <HTMLDialogElement> document.getElementById('offlineDialog')
        this.offlineDialogCloseElem = <HTMLAnchorElement> document.getElementById('offlineDialogClose')
        this.offlineTitleElem = <HTMLElement> document.getElementById('offlineTitle')
        this.downloadAlbumElem = <HTMLInputElement> document.getElementById('downloadAlbum')
        this.deleteAlbumElem = <HTMLInputElement> document.getElementById('deleteAlbum')
        this.stopProcessingElem = <HTMLInputElement> document.getElementById('stopProcessing')
        this.processingInfoElem = <HTMLDivElement> document.getElementById('processingInfo')
        this.processingProgressElem = <HTMLProgressElement> document.getElementById('processingProgress')
        this.audioCacherElem = <HTMLAudioElement> document.getElementById('audioCacher')

        this.resetAppDialogElem = <HTMLDialogElement> document.getElementById('resetAppDialog')
        this.resetAppCloseElem = <HTMLAnchorElement> document.getElementById('resetAppClose')
        this.resetAppConfirmElem = <HTMLAnchorElement> document.getElementById('resetAppConfirm')
    }
} 