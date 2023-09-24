import { AlbumPlayerState } from "../models/album-player-state.js"
import { OfflineService, ProcessedItem } from "../models/album-storage-queryable.js"
import { SuttaPlayerView } from "../views/sutta-player-view.js"
import { SuttaPlayerController } from "./sutta-player-controller.js"

export class OfflineController {
    private _model: AlbumPlayerState
    private _view: SuttaPlayerView
    private _mainCtrl: SuttaPlayerController

    private _appThreadOfflineHandler: OfflineService
    private _activeHandler: OfflineService

    public constructor(mdl: AlbumPlayerState, vw: SuttaPlayerView, ctrl: SuttaPlayerController) {
        this._model = mdl
        this._view = vw
        this._mainCtrl = ctrl
        this._appThreadOfflineHandler = new MainThreadOfflineService(ctrl)
    }

    public async setup() {
        this._registerListeners()
    }

    public async tearDown(): Promise<boolean> {
        this._appThreadOfflineHandler = null
        this._view = null
        this._model = null
        return true
    }

    private _registerListeners() {
        this._view.offlineMenuElem.onclick = async (event) => {
            await this._view.toggleOfflineDialog(event)
        }
        this._view.offlineDialogCloseElem.onclick = this._view.offlineMenuElem.onclick
        this._view.concurrencyCountElem.onchange = async () => {
            this._model.concurrencyCount = this._view.concurrencyCountElem.selectedIndex
        }
        this._view.downloadAlbumElem.onchange = async () => {
            if (this._view.downloadAlbumElem.checked) {
                this._prepareOfflineControls([false, true], [null, null])
                await this._onDownloadAlbum()
            } else 
                this._activeHandler.abortOfflineOperation()
        }
        this._view.deleteAlbumElem.onchange = async () => {
            if (this._view.deleteAlbumElem.checked) {
                this._prepareOfflineControls([true, false], [null, null])
                await this._onRemoveAlbum()
            } else 
                this._activeHandler.abortOfflineOperation()
        }
        this._view.removeAudioFromCacheElem.onclick = async () => {
            const deleted = await this._mainCtrl._albumStore.removeFromCache(this._model.navSel.baseRef, true, true)
            if (deleted[0] && deleted[1]) 
                this._view.removeAudioFromCacheElem.style.display = "none"
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

    private async _onDownloadAlbum(): Promise<void> {
        this._activeHandler = this._getOfflineServiceHandler()
        const baseRefs = await this._mainCtrl._albumStore.queryTrackReferences(this._model.navSel.albumIndex)
        const basePath = this._model.navSel.dictionary['albumRef']
        let currCount = 0
        for (let i = 0; i < baseRefs.length; i++) 
            baseRefs[i] = `${basePath}/${baseRefs[i]}`
        this._model.stopDwnlDel = 1
        await this._activeHandler.startDownloads(baseRefs, async (baseRef, idx, wastxtAudOk, cargo) => {
            if (cargo.wasAborted) 
                await this._handleOperationExit('Downloaded', [false, false], [null, null])
            else {
                currCount++
                this._updateProgress(baseRef, currCount, baseRefs.length)
                // console.log(`Processed: ${baseRef}, ${wastxtAudOk}`)
                if (!(wastxtAudOk[0] && wastxtAudOk[1])) {
                    this._view.updateOfflineInfo(`${baseRef} failure encountered`, -1)
                    this._view.showMessage(`${baseRef} download failed`)
                }
                if (cargo.isLast) 
                  await this._handleOperationExit('Downloaded', [false, false], [false, null])
            }
        })
    }

    private async _onRemoveAlbum(): Promise<void> {
        this._activeHandler = this._getOfflineServiceHandler()
        const baseRefs = await this._mainCtrl._albumStore.queryTrackReferences(this._model.navSel.albumIndex)
        const basePath = this._model.navSel.dictionary['albumRef']
        let currCount = 0
        for (let i = 0; i < baseRefs.length; i++) 
            baseRefs[i] = `${basePath}/${baseRefs[i]}`
        this._model.stopDwnlDel = 2
        await this._activeHandler.startDeletes(baseRefs, async (baseRef, idx, wastxtAudOk, cargo) => {
            if (cargo.wasAborted) 
                await this._handleOperationExit('Deleted', [false, false], [null, null])
            else {
                currCount++
                this._updateProgress(baseRef, currCount, baseRefs.length)
                // console.log(`Processed: ${baseRef}, ${wastxtAudOk}`)
                if (!(wastxtAudOk[0] && wastxtAudOk[1]))
                    this._view.updateOfflineInfo(`${baseRef} failure encountered`, -1)
                if (cargo.isLast) 
                    await this._handleOperationExit('Deleted', [false, false], [null, false])
            }
        })
    }

    private async _handleOperationExit(finalStatusMsg: string, wnDelDisable: boolean[], dwnDelChecked: boolean[]): Promise<void> {
        this._notifyFinalStatus(finalStatusMsg)
        await this._view.refreshTrackSelectionList()
        this._prepareOfflineControls(wnDelDisable, dwnDelChecked)
    }

    private _updateProgress(baseRef: string, currCount: number, totalSize: number) {
        const progVal = Math.round(((currCount+1)/totalSize) * 100)
        this._view.updateOfflineInfo(baseRef, progVal)
    }

    private _getOfflineServiceHandler(): OfflineService {
        let ret = this._appThreadOfflineHandler
        if (this._model.concurrencyCount > 0) {
            ret = this._mainCtrl._albumStore
            ret.setConcurrency(this._model.concurrencyCount)
        }
        return ret
    }

    private _notifyFinalStatus(msgType: string) {
        let userMsg = null
        if (this._model.stopDwnlDel === 0) {
            this._view.updateOfflineInfo('Cancelled', 0)
            userMsg = 'Cancelled Album Processing'
        } else {
            this._view.updateOfflineInfo('Finished', 0)
            userMsg = msgType + ' Album'
        }
        if (!this._view.offlineDialogElem.open && userMsg)
            this._mainCtrl.showUserMessage(userMsg)
        this._model.stopDwnlDel = 0
    }
}

class MainThreadOfflineService implements OfflineService {
    private _mainCtrl: SuttaPlayerController
    private _abortOperation = false

    constructor(ctrl: SuttaPlayerController) {
        this._mainCtrl = ctrl
    }

    public setConcurrency(count: number): number {
        if (count > 0)
            throw new Error("AppThreadOfflineService does not support concurrency")
        return 0
    }

    public async startDownloads(baseRefs: string[], onDownloaded: ProcessedItem): Promise<void> {
        this._abortOperation = false
        for (let i = 0; i < baseRefs.length; i++) {
            if (this._abortOperation) {
                if (onDownloaded)
                    onDownloaded(baseRefs[i], i, null, {isLast: (i+1 === baseRefs.length), wasAborted: true})
                break
            }
            const txtAudOk = await this._mainCtrl._albumStore.addToCache(baseRefs[i], true, true)
            if (onDownloaded)
                onDownloaded(baseRefs[i], i, txtAudOk, {isLast: (i+1 === baseRefs.length), wasAborted: false})
        }
    }

    public async startDeletes(baseRefs: string[], onDeleted: ProcessedItem): Promise<void> {
        this._abortOperation = false
        for (let i = 0; i < baseRefs.length; i++) {
            if (this._abortOperation) {
                if (onDeleted)
                    onDeleted(baseRefs[i], i, null, {isLast: (i+1 === baseRefs.length), wasAborted: true})
                break
            }
            const txtAudOk = await this._mainCtrl._albumStore.removeFromCache(baseRefs[i], true, true)
            if (onDeleted)
                onDeleted(baseRefs[i], i, txtAudOk, {isLast: (i+1 === baseRefs.length), wasAborted: false})
        }
    }

    public abortOfflineOperation(): void {
        this._abortOperation = true
    }
}