export class SuttaPlayerView {
    // settings
    autoPlayElem;
    playNextElem;
    repeatElem;
    linkTextToAudioElem;
    offlineMenuElem;
    resetAppMenuElem;
    // about
    aboutMenuElem;
    aboutDialogElem;
    aboutDialogCloseElem;
    aboutTextBodyElem;
    // selections
    collectionElem;
    suttaElem;
    loadAudioElem;
    loadTextElem;
    loadRandomElem;
    // display
    playingSuttaElem;
    audioPlayerElem;
    displayingSuttaElem;
    suttaTextBodyElem;
    // offline
    offlineDialogElem;
    offlineDialogCloseElem;
    offlineTitleElem;
    downloadAlbumElem;
    deleteAlbumElem;
    stopProcessingElem;
    processingInfoElem;
    processingProgressElem;
    audioCacherElem;
    // reset app
    resetAppDialogElem;
    resetAppCloseElem;
    resetAppConfirmElem;
    _modelState;
    _suttaStore;
    _audioStore;
    constructor(mdl, store, audResolver) {
        this._modelState = mdl;
        this._suttaStore = store;
        this._audioStore = audResolver;
        this._bindHtmlElements();
    }
    async initialise() {
        this._loadCollectionsList();
        this.loadSuttasList();
        await this.loadSuttaText();
        this.refreshAudioControls();
        this.loadSuttaAudio();
    }
    refreshAudioControls() {
        this.autoPlayElem.checked = this._modelState.autoPlay;
        this.audioPlayerElem.autoplay = this._modelState.autoPlay;
        this.playNextElem.checked = this._modelState.playNext;
        this.repeatElem.checked = this._modelState.repeat;
        this.linkTextToAudioElem.checked = this._modelState.linkTextToAudio;
        this.audioPlayerElem.loop = this._modelState.repeat;
        this.processingProgressElem.value = 0;
        this.stopProcessingElem.checked = (this._modelState.stopDwnlDel === 0);
    }
    loadSuttasList() {
        const suttaLov = this._suttaStore.querySuttaReferences(this._modelState.navSel.collectionIndex);
        this.suttaElem.innerHTML = '';
        for (let i = 0; i < suttaLov.length; i++) {
            let option = document.createElement('option');
            option.value = `${i}`;
            option.innerText = suttaLov[i];
            this.suttaElem.append(option);
        }
        this.suttaElem.selectedIndex = this._modelState.navSel.suttaIndex;
    }
    async loadSuttaText() {
        if (this._modelState.textSel.baseRef === null)
            return;
        const textBody = await this._suttaStore.querySuttaText(this._modelState.textSel.baseRef);
        this.suttaTextBodyElem.innerHTML = textBody;
        this.displayingSuttaElem.innerHTML = `&#128083; ${this._modelState.textSel.baseRef}`;
    }
    loadSuttaAudio() {
        const success = this.loadSuttaAudioWith(this._modelState.audioSel, this.audioPlayerElem);
        if (success)
            this.audioPlayerElem.currentTime = this._modelState.currentTime;
    }
    loadSuttaAudioWith(suttaSel, viewAudio) {
        if (suttaSel.baseRef === null)
            return false;
        const srcRef = this._audioStore.queryHtmlAudioSrcRef(suttaSel.baseRef);
        viewAudio.src = srcRef;
        return true;
    }
    updatePlayingSuttaInfo(baseRef, status) {
        let info = status ? ` [${status}]` : '';
        this.playingSuttaElem.innerHTML = `&#127911; ${baseRef}${info}`;
    }
    async toggleAboutInfo(event) {
        if (event)
            event.preventDefault();
        if (this.aboutTextBodyElem.innerHTML.trim() === '') {
            let textBody = await this._suttaStore.readTextFile('./README.md');
            textBody = textBody.replaceAll('###', '-');
            textBody = textBody.replaceAll('#', '');
            this.aboutTextBodyElem.innerHTML = textBody + 'suttaplayer@gmail.com';
        }
        else
            this.aboutTextBodyElem.innerHTML = '';
        this.aboutDialogElem.open = !this.aboutDialogElem.open;
    }
    toggleOfflineDialog(event) {
        if (event)
            event.preventDefault();
        this.offlineDialogElem.open = !this.offlineDialogElem.open;
        if (!this.offlineDialogElem.open)
            return;
        if (this._modelState.stopDwnlDel === 0) {
            let albumName = this.collectionElem.children[this.collectionElem.selectedIndex].innerHTML;
            this.offlineTitleElem.innerHTML = albumName;
        }
    }
    toggleResetAppDialog(event) {
        if (event)
            event.preventDefault();
        this.resetAppDialogElem.open = !this.resetAppDialogElem.open;
    }
    updateOfflineInfo(processingInfo, perc) {
        let actn = 'Choose an action above';
        let disableActivityActions = true;
        if (this._modelState.stopDwnlDel === 1)
            actn = 'Downloading';
        else if (this._modelState.stopDwnlDel === 2)
            actn = 'Deleting';
        else if (this._modelState.stopDwnlDel === 0 && processingInfo === '' && perc === 0)
            disableActivityActions = false;
        this.processingInfoElem.innerHTML = `${actn} ${processingInfo}`;
        this.processingProgressElem.value = perc;
        this.downloadAlbumElem.disabled = disableActivityActions;
        this.deleteAlbumElem.disabled = disableActivityActions;
    }
    _loadCollectionsList() {
        const colLov = this._suttaStore.queryCollectionNames();
        for (let i = 0; i < colLov.length; i++) {
            let option = document.createElement('option');
            option.value = `${i}`;
            option.innerText = colLov[i];
            this.collectionElem.append(option);
        }
        this.collectionElem.selectedIndex = this._modelState.navSel.collectionIndex;
    }
    _bindHtmlElements() {
        this.autoPlayElem = document.getElementById('autoPlay');
        this.playNextElem = document.getElementById('playNext');
        this.repeatElem = document.getElementById('repeat');
        this.linkTextToAudioElem = document.getElementById('linkTextToAudio');
        this.offlineMenuElem = document.getElementById('offlineMenu');
        this.resetAppMenuElem = document.getElementById('resetAppMenu');
        this.aboutMenuElem = document.getElementById('aboutMenu');
        this.aboutDialogElem = document.getElementById('aboutDialog');
        this.aboutDialogCloseElem = document.getElementById('aboutDialogClose');
        this.aboutTextBodyElem = document.getElementById('aboutTextBody');
        this.collectionElem = document.getElementById('collection');
        this.suttaElem = document.getElementById('sutta');
        this.loadAudioElem = document.getElementById('loadAudio');
        this.loadTextElem = document.getElementById('loadText');
        this.loadRandomElem = document.getElementById('loadRandom');
        this.playingSuttaElem = document.getElementById('playingSutta');
        this.audioPlayerElem = document.getElementById('audioPlayer');
        this.displayingSuttaElem = document.getElementById('displayingSutta');
        this.suttaTextBodyElem = document.getElementById('suttaTextBody');
        this.offlineDialogElem = document.getElementById('offlineDialog');
        this.offlineDialogCloseElem = document.getElementById('offlineDialogClose');
        this.offlineTitleElem = document.getElementById('offlineTitle');
        this.downloadAlbumElem = document.getElementById('downloadAlbum');
        this.deleteAlbumElem = document.getElementById('deleteAlbum');
        this.stopProcessingElem = document.getElementById('stopProcessing');
        this.processingInfoElem = document.getElementById('processingInfo');
        this.processingProgressElem = document.getElementById('processingProgress');
        this.audioCacherElem = document.getElementById('audioCacher');
        this.resetAppDialogElem = document.getElementById('resetAppDialog');
        this.resetAppCloseElem = document.getElementById('resetAppClose');
        this.resetAppConfirmElem = document.getElementById('resetAppConfirm');
    }
}
//# sourceMappingURL=sutta-player-view.js.map