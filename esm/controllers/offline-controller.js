export class OfflineController {
    _model;
    _view;
    _mainCtrl;
    _appThreadOfflineHandler;
    _activeHandler;
    constructor(mdl, vw, ctrl) {
        this._model = mdl;
        this._view = vw;
        this._mainCtrl = ctrl;
        this._appThreadOfflineHandler = new MainThreadOfflineService(ctrl);
    }
    async setup() {
        this._registerListeners();
    }
    async tearDown() {
        this._appThreadOfflineHandler = null;
        this._view = null;
        this._model = null;
        return true;
    }
    _registerListeners() {
        this._view.offlineMenuElem.onclick = async (event) => {
            this._view.toggleOfflineDialog(event);
        };
        this._view.offlineDialogCloseElem.onclick = this._view.offlineMenuElem.onclick;
        this._view.concurrencyCountElem.onchange = async () => {
            this._model.concurrencyCount = this._view.concurrencyCountElem.selectedIndex;
        };
        this._view.downloadAlbumElem.onchange = async () => {
            if (this._view.downloadAlbumElem.checked) {
                this._prepareOfflineControls([false, true], [null, null]);
                await this._onDownloadAlbum();
            }
            else
                this._activeHandler.abortOperation();
        };
        this._view.deleteAlbumElem.onchange = async () => {
            if (this._view.deleteAlbumElem.checked) {
                this._prepareOfflineControls([true, false], [null, null]);
                await this._onRemoveAlbum();
            }
            else
                this._activeHandler.abortOperation();
        };
        this._view.removeAudioFromCacheElem.onclick = async () => {
            const deleted = await this._mainCtrl._albumStore.removeFromCache(this._model.navSel.baseRef, true, true);
            if (deleted[0] && deleted[1])
                this._view.removeAudioFromCacheElem.style.display = "none";
        };
    }
    _prepareOfflineControls(dwnDelDisable, dwnDelChecked) {
        this._view.downloadAlbumElem.disabled = dwnDelDisable[0];
        this._view.deleteAlbumElem.disabled = dwnDelDisable[1];
        if (dwnDelChecked[0] !== null)
            this._view.downloadAlbumElem.checked = dwnDelChecked[0];
        if (dwnDelChecked[1] !== null)
            this._view.deleteAlbumElem.checked = dwnDelChecked[1];
    }
    async _onDownloadAlbum() {
        this._activeHandler = this._getOfflineServiceHandler();
        const baseRefs = this._mainCtrl._albumStore.queryTrackReferences(this._model.navSel.albumIndex);
        const basePath = this._model.navSel.dictionary['albumRef'];
        let currCount = 0;
        for (let i = 0; i < baseRefs.length; i++)
            baseRefs[i] = `${basePath}/${baseRefs[i]}`;
        this._model.stopDwnlDel = 1;
        await this._activeHandler.startDownloads(baseRefs, (baseRef, idx, wastxtAudOk, cargo) => {
            if (cargo.wasAborted)
                this._handleOperationExit('Downloaded', [false, false], [null, null]);
            else {
                currCount++;
                this._updateProgress(baseRef, currCount, baseRefs.length);
                // console.log(`Processed: ${baseRef}, ${wastxtAudOk}`)
                if (!(wastxtAudOk[0] && wastxtAudOk[1])) {
                    this._view.updateOfflineInfo(`${baseRef} failure encountered`, -1);
                    this._view.showMessage(`${baseRef} download failed`);
                }
                if (cargo.isLast)
                    this._handleOperationExit('Downloaded', [false, false], [false, null]);
            }
        });
    }
    async _onRemoveAlbum() {
        this._activeHandler = this._getOfflineServiceHandler();
        const baseRefs = this._mainCtrl._albumStore.queryTrackReferences(this._model.navSel.albumIndex);
        const basePath = this._model.navSel.dictionary['albumRef'];
        let currCount = 0;
        for (let i = 0; i < baseRefs.length; i++)
            baseRefs[i] = `${basePath}/${baseRefs[i]}`;
        this._model.stopDwnlDel = 2;
        await this._activeHandler.startDeletes(baseRefs, (baseRef, idx, wastxtAudOk, cargo) => {
            if (cargo.wasAborted)
                this._handleOperationExit('Deleted', [false, false], [null, null]);
            else {
                currCount++;
                this._updateProgress(baseRef, currCount, baseRefs.length);
                // console.log(`Processed: ${baseRef}, ${wastxtAudOk}`)
                if (!(wastxtAudOk[0] && wastxtAudOk[1]))
                    this._view.updateOfflineInfo(`${baseRef} failure encountered`, -1);
                if (cargo.isLast)
                    this._handleOperationExit('Deleted', [false, false], [null, false]);
            }
        });
    }
    _handleOperationExit(finalStatusMsg, wnDelDisable, dwnDelChecked) {
        this._notifyFinalStatus(finalStatusMsg);
        this._view.refreshTrackSelectionList();
        this._prepareOfflineControls(wnDelDisable, dwnDelChecked);
    }
    _updateProgress(baseRef, currCount, totalSize) {
        const progVal = Math.round(((currCount + 1) / totalSize) * 100);
        this._view.updateOfflineInfo(baseRef, progVal);
    }
    _getOfflineServiceHandler() {
        let ret = this._appThreadOfflineHandler;
        if (this._model.concurrencyCount > 0) {
            ret = this._mainCtrl._albumStore;
            ret.setConcurrency(this._model.concurrencyCount);
        }
        return ret;
    }
    _notifyFinalStatus(msgType) {
        let userMsg = null;
        if (this._model.stopDwnlDel === 0) {
            this._view.updateOfflineInfo('Cancelled', 0);
            userMsg = 'Cancelled Album Processing';
        }
        else {
            this._view.updateOfflineInfo('Finished', 0);
            userMsg = msgType + ' Album';
        }
        if (!this._view.offlineDialogElem.open && userMsg)
            this._mainCtrl.showUserMessage(userMsg);
        this._model.stopDwnlDel = 0;
    }
}
class MainThreadOfflineService {
    _mainCtrl;
    _abortOperation = false;
    constructor(ctrl) {
        this._mainCtrl = ctrl;
    }
    setConcurrency(count) {
        if (count > 0)
            throw new Error("AppThreadOfflineService does not support concurrency");
        return 0;
    }
    async startDownloads(baseRefs, onDownloaded) {
        this._abortOperation = false;
        for (let i = 0; i < baseRefs.length; i++) {
            if (this._abortOperation) {
                if (onDownloaded)
                    onDownloaded(baseRefs[i], i, null, { isLast: (i + 1 === baseRefs.length), wasAborted: true });
                break;
            }
            const txtAudOk = await this._mainCtrl._albumStore.addToCache(baseRefs[i], true, true);
            if (onDownloaded)
                onDownloaded(baseRefs[i], i, txtAudOk, { isLast: (i + 1 === baseRefs.length), wasAborted: false });
        }
    }
    async startDeletes(baseRefs, onDeleted) {
        this._abortOperation = false;
        for (let i = 0; i < baseRefs.length; i++) {
            if (this._abortOperation) {
                if (onDeleted)
                    onDeleted(baseRefs[i], i, null, { isLast: (i + 1 === baseRefs.length), wasAborted: true });
                break;
            }
            const txtAudOk = await this._mainCtrl._albumStore.removeFromCache(baseRefs[i], true, true);
            if (onDeleted)
                onDeleted(baseRefs[i], i, txtAudOk, { isLast: (i + 1 === baseRefs.length), wasAborted: false });
        }
    }
    abortOperation() {
        this._abortOperation = true;
    }
}
//# sourceMappingURL=offline-controller.js.map