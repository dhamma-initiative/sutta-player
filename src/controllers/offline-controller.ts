import { SuttaPlayerState, TrackSelection } from "../models/sutta-player-state.js"
import { DeferredPromise } from "../runtime/deferred-promise.js"
import { SuttaPlayerView } from "../views/sutta-player-view.js"
import { SuttaPlayerController } from "./sutta-player-controller.js"

type OfflineProcessingCallback = (currTrack: TrackSelection) => Promise<boolean>

export class OfflineController {
    private _model: SuttaPlayerState
    private _view: SuttaPlayerView
    private _mainCtrl: SuttaPlayerController
    private _downloadedPromise: DeferredPromise<boolean>

    public constructor(mdl: SuttaPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController) {
        this._model = mdl
        this._view = vw
        this._mainCtrl = ctrl
    }

    public async setup() {
        this._registerListeners()
    }

    public async tearDown(): Promise<boolean> {
        this._view = null
        this._model = null
        return true
    }

    public async onToggleDownload(): Promise<boolean> {
        return false
    }

    public async onToggleDetele(): Promise<boolean> {
        return false
    }


    private _registerListeners() {
        this._view.offlineMenuElem.onclick = async (event) => {
            this._view.toggleOfflineDialog(event)
        }
        this._view.offlineDialogCloseElem.onclick = this._view.offlineMenuElem.onclick
        this._view.downloadAlbumElem.onchange = async () => {
            if (this._view.downloadAlbumElem.checked) {
                this._model.stopDwnlDel = 1
                this._prepareOfflineControls([false, true], [null, null])
                await this._onDownloadAlbum()
                this._prepareOfflineControls([false, false], [false, null])
            } else {
                this._model.stopDwnlDel = 0
                if (this._downloadedPromise !== null)
                    this._downloadedPromise.resolve(false)
                this._prepareOfflineControls([false, false], [null, null])
            }
        }
        this._view.deleteAlbumElem.onchange = async () => {
            if (this._view.deleteAlbumElem.checked) {
                this._model.stopDwnlDel = 2
                this._prepareOfflineControls([true, false], [null, null])
                await this._onRemoveAlbum()
                this._prepareOfflineControls([false, false], [null, false])
            } else {
                this._model.stopDwnlDel = 0
                this._prepareOfflineControls([false, false], [null, null])
            }
        }
        this._view.audioCacherElem.oncanplaythrough = async () => {
            this._downloadedPromise.resolve(true)
        }
        this._view.removeAudioFromCacheElem.onclick = async () => {
            if (this._model.audioState === 1) { // stuck in assigned state
                const deleted = await this._mainCtrl._audioStore.removeFromCache(this._model.audioSel.baseRef)
                if (deleted)
                    this._view.removeAudioFromCacheElem.style.display = "none"
            }
        }
    }

    private _prepareOfflineControls(dwnDelDisable: boolean[], dwnDelChecked: boolean[]) {
        this._view.downloadAlbumElem.disabled = dwnDelDisable[0]
        this._view.deleteAlbumElem.disabled = dwnDelDisable[1]
        if (dwnDelChecked[0] !== null)
            this._view.downloadAlbumElem.checked = dwnDelChecked[0]
        if (dwnDelChecked[1] !== null)
            this._view.deleteAlbumElem.checked = dwnDelChecked[1]
    }


    private async _onDownloadAlbum() {
        const downloadHandler: OfflineProcessingCallback = async (currTrack: TrackSelection) =>  {
            this._view.loadTrackWith(currTrack)
            this._downloadedPromise = new DeferredPromise<boolean>()
            this._view.loadSuttaAudioWith(currTrack, this._view.audioCacherElem)
            const wasDownloaded = await this._downloadedPromise
            return wasDownloaded
        }
        const procSel = await this._onOfflineAlbumProcessing(downloadHandler, 'Downloaded')
        if (procSel.dictionary['completed']) {
            this._model.downloadedAlbums.push(procSel.albumIndex)
            this._view.loadAlbumsList()
        }
    }

    private async _onRemoveAlbum() {
        const removeHandler: OfflineProcessingCallback = async (currTrack: TrackSelection) =>  {
            const wasDeleted = await this._mainCtrl._audioStore.removeFromCache(currTrack.baseRef)
            return wasDeleted
        }
        const procSel = await this._onOfflineAlbumProcessing(removeHandler, 'Removed')
        if (procSel.dictionary['completed']) {
            const idxPos = this._model.downloadedAlbums.indexOf(procSel.albumIndex)  
            this._model.downloadedAlbums.splice(idxPos, 1)
            this._view.loadAlbumsList()
        }
    }

    private async _onOfflineAlbumProcessing(handler: OfflineProcessingCallback, msgType: string): Promise<TrackSelection> {
        const processSel = new TrackSelection('cache')
        processSel.dictionary['completed'] = true
        processSel.albumIndex = this._model.navSel.albumIndex
        const fileList = this._mainCtrl._suttaStore.queryTrackReferences(this._model.navSel.albumIndex)
        const urls: string[] = []
        for (let i = 0; i < fileList.length; i++) {
            const progVal = Math.round(((i+1)/fileList.length) * 100)
            processSel.trackIndex = i
            processSel.updateBaseRef(this._mainCtrl._suttaStore)
            this._view.updateOfflineInfo(processSel.baseRef, progVal)
            const wasProcessed = await handler(processSel)
            console.log(`Processed: ${processSel.baseRef}: ${wasProcessed}`)
            if (this._model.stopDwnlDel === 0) {
                processSel.dictionary['completed'] = false
                break
            }
        }
        if (this._model.stopDwnlDel !== 0) {
            this._view.updateOfflineInfo('Finished', 0)
            if (!this._view.offlineDialogElem.open)
                this._mainCtrl.showUserMessage(msgType + ' Album')
        } else {
            this._view.updateOfflineInfo('Cancelled', 0)
            if (!this._view.offlineDialogElem.open)
            this._mainCtrl.showUserMessage('Cancelled Album Processing')
        }
        this._model.stopDwnlDel = 0
        return processSel
    }
}