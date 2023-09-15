import { AlbumPlayerState, TrackSelection } from "../models/album-player-state.js"
import { SuttaPlayerView } from "../views/sutta-player-view.js"
import { SuttaPlayerController } from "./sutta-player-controller.js"

type OfflineProcessingCallback = (currTrack: TrackSelection) => Promise<boolean>

export class OfflineController {
    private _model: AlbumPlayerState
    private _view: SuttaPlayerView
    private _mainCtrl: SuttaPlayerController

    public constructor(mdl: AlbumPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController) {
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

    public async onToggleDelete(): Promise<boolean> {
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
        this._view.removeAudioFromCacheElem.onclick = async () => {
            const deleted = await this._mainCtrl._audioStore.removeFromCache(this._view.removeFromCacheBaseRef)
            if (deleted) {
                await this._mainCtrl._albumStore.removeFromCache(this._view.removeFromCacheBaseRef)
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
            const wasTextDownloaded = await this._mainCtrl._albumStore.addToCache(currTrack.baseRef)
            const wasAudioDownloaded = await this._mainCtrl._audioStore.addToCache(currTrack.baseRef)
            return wasTextDownloaded && wasAudioDownloaded
        }
        const procSel = await this._onOfflineAlbumProcessing(downloadHandler, 'Downloaded')
    }

    private async _onRemoveAlbum() {
        const removeHandler: OfflineProcessingCallback = async (currTrack: TrackSelection) =>  {
            const wasTextDeleted = await this._mainCtrl._albumStore.removeFromCache(currTrack.baseRef)
            const wasAudioDeleted = await this._mainCtrl._audioStore.removeFromCache(currTrack.baseRef)
            return wasTextDeleted && wasAudioDeleted
        }
        const procSel = await this._onOfflineAlbumProcessing(removeHandler, 'Removed')
    }

    private async _onOfflineAlbumProcessing(handler: OfflineProcessingCallback, msgType: string): Promise<TrackSelection> {
        const processSel = new TrackSelection('cache')
        processSel.dictionary['completed'] = true
        processSel.albumIndex = this._model.navSel.albumIndex
        const fileList = this._mainCtrl._albumStore.queryTrackReferences(this._model.navSel.albumIndex)
        const urls: string[] = []
        for (let i = 0; i < fileList.length; i++) {
            const progVal = Math.round(((i+1)/fileList.length) * 100)
            processSel.trackIndex = i
            processSel.updateBaseRef(this._mainCtrl._albumStore)
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