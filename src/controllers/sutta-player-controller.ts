import { SuttaPlayerView } from '../views/sutta-player-view.js'

import { AudioStorageQueryable } from '../models/audio-storage-queryable.js'
import { SuttaPlayerState, TrackSelection } from '../models/sutta-player-state.js'
import { SuttaStorageQueryable } from "../models/sutta-storage-queryable.js"
import { DeferredPromise } from '../runtime/deferred-promise.js'

type OfflineProcessingCallback = (currTrack: TrackSelection) => Promise<boolean>

export class SuttaPlayerController {
    private _audioStore: AudioStorageQueryable
    private _suttaStore: SuttaStorageQueryable

    private _appRoot: string
    private _view: SuttaPlayerView
    private _model: SuttaPlayerState

    private _downloadedPromise: DeferredPromise<boolean>

    public constructor(appRoot: string, suttaStorage: SuttaStorageQueryable, audioStorage: AudioStorageQueryable) {
        this._appRoot = appRoot
        this._suttaStore = suttaStorage
        this._audioStore = audioStorage
        this._model = new SuttaPlayerState()
        this._view = new SuttaPlayerView(this._model, this._suttaStore, this._audioStore)
    }

    public async setup() {
        this._model.load()
        this._loadShareLinkIfSpecified()
        if (this._model.navSel.baseRef === null)
            this._model.navSel.updateBaseRef(this._suttaStore)
        await this._view.initialise()
		this._registerListeners()
    }

    public async tearDown() {
        this._model.save()
        this._view = null
        this._model = null
    }

    private _registerListeners() {
        this._view.albumElem.onchange = async () => {
            if (this._view.albumElem.selectedIndex !== this._model.navSel.albumIndex)
                this._onAlbumSelected(null)
        }
        this._view.trackElem.onclick = async () => {
            this._onSuttaSelected(null)
        }
        this._view.loadAudioElem.onclick = async () => {
            await this._onLoadAudio(this._model.navSel)
        }
        this._view.loadTextElem.onclick = async () => {
            this._onLoadText(this._model.navSel)
        }
        this._view.loadRandomElem.onclick = async () => {
            await this._onLoadRandom()
        }
        this._view.shareLinkElem.onclick = async () => {
            this._onShareLink(this._model.navSel)
        }
        this._view.aboutMenuElem.onclick = async (event) => {
            await this._view.toggleAboutInfo(event)
        }
        this._view.aboutDialogCloseElem.onclick = this._view.aboutMenuElem.onclick
        this._view.audioPlayerElem.onloadeddata = async () => {
            this._view.updatePlayingTrackInfo(this._model.audioSel.baseRef, 'loaded')
        }
        this._view.audioPlayerElem.onplay = async () => {
            this._view.updatePlayingTrackInfo(this._model.audioSel.baseRef, 'playing')
        }
        this._view.audioPlayerElem.onpause = async () => {
            this._view.updatePlayingTrackInfo(this._model.audioSel.baseRef, 'paused')
        }
        this._view.audioPlayerElem.onended = async () => {
            await this._onAudioEnded()
        }
        this._view.audioPlayerElem.ontimeupdate = async () => {
            this._model.currentTime = this._view.audioPlayerElem.currentTime
        }
        this._view.autoPlayElem.onchange = async () => {
            this._model.autoPlay = this._view.autoPlayElem.checked
            this._view.refreshAudioControls()
        }
        this._view.playNextElem.onchange = async () => {
            this._model.playNext = this._view.playNextElem.checked
            if (this._model.playNext) 
                this._model.repeat = false
            this._view.refreshAudioControls()
        }
        this._view.repeatElem.onchange = async () => {
            this._model.repeat = this._view.repeatElem.checked
            if (this._model.repeat)
                this._model.playNext = false
            this._view.refreshAudioControls()
        }
        this._view.linkTextToAudioElem.onchange = async () => {
            this._model.linkTextToAudio = this._view.linkTextToAudioElem.checked
            if (this._model.linkTextToAudio) 
                this._onLoadText(this._model.audioSel)
        }
        this._view.offlineMenuElem.onclick = async (event) => {
            this._view.toggleOfflineDialog(event)
        }
        this._view.offlineDialogCloseElem.onclick = this._view.offlineMenuElem.onclick
        this._view.downloadAlbumElem.onclick = async () => {
            this._model.stopDwnlDel = 1
            await this._onDownloadAlbum()
        }
        this._view.deleteAlbumElem.onclick = async () => {
            this._model.stopDwnlDel = 2
            await this._onRemoveAlbum()
        }
        this._view.stopProcessingElem.onclick = async () => {
            if (this._model.stopDwnlDel === 1) {
                if (this._downloadedPromise !== null)
                    this._downloadedPromise.resolve(false)
            }
            this._model.stopDwnlDel = 0
            this._view.stopProcessingElem.checked = true

        }
        this._view.audioCacherElem.oncanplaythrough = async () => {
            this._downloadedPromise.resolve(true)
        }
        this._view.resetAppMenuElem.onclick = async (event) => {
            this._view.toggleResetAppDialog(event)
        }
        this._view.resetAppCloseElem.onclick = this._view.resetAppMenuElem.onclick
        this._view.resetAppConfirmElem.onclick = async (event) => {
            await this._onResetAppConfirm()
            this._view.toggleResetAppDialog(event)
        }
        this._view.playingTrackElem.ondblclick = async () => {
            this._onLoadIntoNavSelector(this._model.audioSel)
        }
        this._view.displayingTrackElem.ondblclick = async () => {
            this._onLoadIntoNavSelector(this._model.textSel)
        }
    }

    private async _onAudioEnded() {
        this._view.updatePlayingTrackInfo(this._model.audioSel.baseRef, 'played')
        if (this._model.playNext) {
            const fileList = this._suttaStore.queryTrackReferences(this._model.audioSel.albumIndex)
            if (this._model.audioSel.trackIndex < fileList.length-1) {
                this._model.audioSel.trackIndex++
                this._model.audioSel.updateBaseRef(this._suttaStore)
                await this._onLoadAudio(this._model.audioSel)
            }
        }
    }

    private _onAlbumSelected(forceAlbIdx: number) {
        this._model.navSel.albumIndex = (forceAlbIdx === null) ? Number(this._view.albumElem.value) : forceAlbIdx
        this._model.navSel.trackIndex = 0
        this._view.trackElem.selectedIndex = this._model.navSel.trackIndex
        this._model.navSel.updateBaseRef(this._suttaStore)
        this._view.loadTracksList()
    }

    private _onSuttaSelected(forceTrackIdx: number) {
        this._model.navSel.trackIndex = (forceTrackIdx === null) ?  Number(this._view.trackElem.value) : forceTrackIdx
        this._model.navSel.updateBaseRef(this._suttaStore)
    }

    private async _onLoadAudio(srcSel: TrackSelection) {
        this._model.currentTime = 0
        this._model.audioSel.read(srcSel)
        this._view.loadTrackAudio()
        if (this._model.linkTextToAudio) 
            await this._onLoadText(this._model.audioSel)
    }

    private async _onLoadText(srcSel: TrackSelection) {
        this._model.textSel.read(srcSel)
        await this._view.loadTrackText()
    }

    private async _onLoadRandom() {
        this._model.navSel.albumIndex = Math.round(Math.random() * this._view.albumElem.length)
        const fileList = this._suttaStore.queryTrackReferences(this._model.navSel.albumIndex)
        this._model.navSel.trackIndex = Math.round(Math.random() * fileList.length)
        this._model.navSel.updateBaseRef(this._suttaStore)
        this._view.albumElem.selectedIndex = this._model.navSel.albumIndex
        this._view.trackElem.selectedIndex = this._model.navSel.trackIndex
        await this._onLoadAudio(this._model.navSel)
    }

    private async _onDownloadAlbum() {
        const downloadHandler: OfflineProcessingCallback = async (currTrack: TrackSelection) =>  {
            this._downloadedPromise = new DeferredPromise<boolean>()
            this._view.loadSuttaAudioWith(currTrack, this._view.audioCacherElem)
            const wasDownloaded = await this._downloadedPromise
            return wasDownloaded
        }
        await this._onOfflineAlbumProcessing(downloadHandler)
    }

    private async _onRemoveAlbum() {
        const removeHandler: OfflineProcessingCallback = async (currTrack: TrackSelection) =>  {
            const wasDeleted = await this._audioStore.removeFromCache(currTrack.baseRef)
            return wasDeleted
        }
        await this._onOfflineAlbumProcessing(removeHandler)
    }

    private async _onOfflineAlbumProcessing(handler: OfflineProcessingCallback) {
        let processSel = new TrackSelection('cache')
        processSel.albumIndex = this._model.navSel.albumIndex
        const fileList = this._suttaStore.queryTrackReferences(this._model.navSel.albumIndex)
        let urls: string[] = []
        for (let i = 0; i < fileList.length; i++) {
            let progVal = Math.round(((i+1)/fileList.length) * 100)
            processSel.trackIndex = i
            processSel.updateBaseRef(this._suttaStore)
            this._view.updateOfflineInfo(processSel.baseRef, progVal)
            const wasProcessed = await handler(processSel)
            console.log(`Processed: ${processSel.baseRef}: ${wasProcessed}`)
            if (this._model.stopDwnlDel === 0)
                break
        }
        this._model.stopDwnlDel = 0
        this._view.updateOfflineInfo('', 0)
        this._view.stopProcessingElem.checked = true    
    }

    private async _onResetAppConfirm() {
        localStorage.clear()
        let keys = await caches.keys()
        for (let i = 0; i < keys.length; i++) 
            await caches.delete(keys[i])            
        const swReg = await navigator.serviceWorker.getRegistration()
        await swReg.unregister()
    }

    private _onShareLink(srcSel: TrackSelection) {
        let baseRefHref = location.protocol + '//' + location.host + this._appRoot
        baseRefHref += '#' + srcSel.baseRef + `?startTime=${this._model.currentTime}`
        navigator.clipboard.writeText(baseRefHref)
    }

    private _onLoadIntoNavSelector(srcSel: TrackSelection) {
        this._model.navSel.read(srcSel)
        this._view.albumElem.selectedIndex = this._model.navSel.albumIndex
        this._view.trackElem.selectedIndex = this._model.navSel.trackIndex
    }

    private _loadShareLinkIfSpecified() {
        let href = location.href
        let url = new URL(href)
        if (url.hash) {
            href = href.replace('#','')
            url = new URL(href)
            let baseRef = url.pathname.substring(this._appRoot.length)
            if (baseRef.startsWith('/'))
                baseRef = baseRef.substring(1)
            let urlSel = this._suttaStore.queryTrackSelection(baseRef)
            if (urlSel.albumIndex > -1 && urlSel.trackIndex > -1) {
                this._model.navSel.read(urlSel)
                this._model.audioSel.read(urlSel)
                this._model.textSel.read(urlSel)
                this._model.currentTime = Number(url.searchParams.get('startTime'))
                this._view.albumTrackSelectionElem.open = false
            }
        }
    }
} 