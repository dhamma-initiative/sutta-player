import { SuttaPlayerView } from '../views/sutta-player-view.js'

import { AudioStorageQueryable } from '../models/audio-storage-queryable.js'
import { SuttaPlayerState, SuttaSelection } from '../models/sutta-player-state.js'
import { SuttaStorageQueryable } from "../models/sutta-storage-queryable.js"
import { DeferredPromise } from '../runtime/deferred-promise.js'

type OfflineProcessingCallback = (currTrack: SuttaSelection) => Promise<boolean>

export class SuttaPlayerController {
    private _audioStore: AudioStorageQueryable
    private _suttaStore: SuttaStorageQueryable
    
    private _view: SuttaPlayerView
    private _model: SuttaPlayerState

    private _downloadedPromise: DeferredPromise<boolean>

    public constructor(suttaStorage: SuttaStorageQueryable, audioStorage: AudioStorageQueryable) {
        this._suttaStore = suttaStorage
        this._audioStore = audioStorage
        this._model = new SuttaPlayerState()
        this._view = new SuttaPlayerView(this._model, this._suttaStore, this._audioStore)
    }

    public async setup() {
        this._model.load()
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
        this._view.collectionElem.onchange = async () => {
            if (this._view.collectionElem.selectedIndex !== this._model.navSel.collectionIndex)
                this._onCollectionSelected(null)
        }
        this._view.suttaElem.onclick = async () => {
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
        this._view.aboutMenuElem.onclick = async (event) => {
            await this._view.toggleAboutInfo(event)
        }
        this._view.aboutDialogCloseElem.onclick = this._view.aboutMenuElem.onclick
        this._view.audioPlayerElem.onloadeddata = async () => {
            this._view.updatePlayingSuttaInfo(this._model.audioSel.baseRef, 'loaded')
        }
        this._view.audioPlayerElem.onplay = async () => {
            this._view.updatePlayingSuttaInfo(this._model.audioSel.baseRef, 'playing')
        }
        this._view.audioPlayerElem.onpause = async () => {
            this._view.updatePlayingSuttaInfo(this._model.audioSel.baseRef, 'paused')
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
    }

    private async _onAudioEnded() {
        this._view.updatePlayingSuttaInfo(this._model.audioSel.baseRef, 'played')
        if (this._model.playNext) {
            const fileList = this._suttaStore.querySuttaReferences(this._model.audioSel.collectionIndex)
            if (this._model.audioSel.suttaIndex < fileList.length-1) {
                this._model.audioSel.suttaIndex++
                this._model.audioSel.updateBaseRef(this._suttaStore)
                await this._onLoadAudio(this._model.audioSel)
            }
        }
    }

    private _onCollectionSelected(forceColIdx: number) {
        this._model.navSel.collectionIndex = (forceColIdx === null) ? Number(this._view.collectionElem.value) : forceColIdx
        this._model.navSel.suttaIndex = 0
        this._view.suttaElem.selectedIndex = this._model.navSel.suttaIndex
        this._model.navSel.updateBaseRef(this._suttaStore)
        this._view.loadSuttasList()
    }

    private _onSuttaSelected(forceSuttaIdx: number) {
        this._model.navSel.suttaIndex = (forceSuttaIdx === null) ?  Number(this._view.suttaElem.value) : forceSuttaIdx
        this._model.navSel.updateBaseRef(this._suttaStore)
    }

    private async _onLoadAudio(srcSel: SuttaSelection) {
        this._model.currentTime = 0
        this._model.audioSel.read(srcSel)
        this._view.loadSuttaAudio()
        if (this._model.linkTextToAudio) 
            await this._onLoadText(this._model.audioSel)
    }

    private async _onLoadText(srcSel: SuttaSelection) {
        this._model.textSel.read(srcSel)
        await this._view.loadSuttaText()
    }

    private async _onLoadRandom() {
        this._model.navSel.collectionIndex = Math.round(Math.random() * this._view.collectionElem.length)
        const fileList = this._suttaStore.querySuttaReferences(this._model.navSel.collectionIndex)
        this._model.navSel.suttaIndex = Math.round(Math.random() * fileList.length)
        this._model.navSel.updateBaseRef(this._suttaStore)
        this._view.collectionElem.selectedIndex = this._model.navSel.collectionIndex
        this._view.suttaElem.selectedIndex = this._model.navSel.suttaIndex
        await this._onLoadAudio(this._model.navSel)
    }

    private async _onDownloadAlbum() {
        const downloadHandler: OfflineProcessingCallback = async (currTrack: SuttaSelection) =>  {
            this._downloadedPromise = new DeferredPromise<boolean>()
            this._view.loadSuttaAudioWith(currTrack, this._view.audioCacherElem)
            const wasDownloaded = await this._downloadedPromise
            return wasDownloaded
        }
        await this._onOfflineAlbumProcessing(downloadHandler)
    }

    private async _onRemoveAlbum() {
        const removeHandler: OfflineProcessingCallback = async (currTrack: SuttaSelection) =>  {
            const wasDeleted = await this._audioStore.removeFromCache(currTrack.baseRef)
            return wasDeleted
        }
        await this._onOfflineAlbumProcessing(removeHandler)
    }

    private async _onOfflineAlbumProcessing(handler: OfflineProcessingCallback) {
        let processSel = new SuttaSelection('cache')
        processSel.collectionIndex = this._model.navSel.collectionIndex
        const fileList = this._suttaStore.querySuttaReferences(this._model.navSel.collectionIndex)
        let urls: string[] = []
        for (let i = 0; i < fileList.length; i++) {
            let progVal = Math.round(((i+1)/fileList.length) * 100)
            processSel.suttaIndex = i
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
} 