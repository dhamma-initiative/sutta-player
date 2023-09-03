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
    albumTrackSelectionElem;
    albumElem;
    trackElem;
    loadAudioElem;
    loadTextElem;
    loadRandomElem;
    shareLinkElem;
    // display
    playingTrackElem;
    audioPlayerElem;
    displayingTrackElem;
    trackTextBodyElem;
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
        this._loadAlbumsList();
        this.loadTracksList();
        await this.loadTrackText();
        this.refreshAudioControls();
        this.loadTrackAudio();
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
    loadTracksList() {
        const trackLov = this._suttaStore.queryTrackReferences(this._modelState.navSel.albumIndex);
        this.trackElem.innerHTML = '';
        for (let i = 0; i < trackLov.length; i++) {
            let option = document.createElement('option');
            option.value = `${i}`;
            option.innerText = trackLov[i];
            this.trackElem.append(option);
        }
        this.trackElem.selectedIndex = this._modelState.navSel.trackIndex;
    }
    async loadTrackText() {
        if (this._modelState.textSel.baseRef === null)
            return;
        const textBody = await this._suttaStore.queryTrackText(this._modelState.textSel.baseRef);
        this.trackTextBodyElem.innerHTML = textBody;
        this.displayingTrackElem.innerHTML = `&#128083; ${this._modelState.textSel.baseRef}`;
    }
    loadTrackAudio() {
        const success = this.loadSuttaAudioWith(this._modelState.audioSel, this.audioPlayerElem);
        if (success)
            this.audioPlayerElem.currentTime = this._modelState.currentTime;
    }
    loadSuttaAudioWith(trackSel, viewAudio) {
        if (trackSel.baseRef === null)
            return false;
        const srcRef = this._audioStore.queryHtmlAudioSrcRef(trackSel.baseRef);
        viewAudio.src = srcRef;
        return true;
    }
    updatePlayingTrackInfo(baseRef, status) {
        let info = status ? ` [${status}]` : '';
        this.playingTrackElem.innerHTML = `&#127911; ${baseRef}${info}`;
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
            let albumName = this.albumElem.children[this.albumElem.selectedIndex].innerHTML;
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
    _loadAlbumsList() {
        const colLov = this._suttaStore.queryAlbumNames();
        for (let i = 0; i < colLov.length; i++) {
            let option = document.createElement('option');
            option.value = `${i}`;
            option.innerText = colLov[i];
            this.albumElem.append(option);
        }
        this.albumElem.selectedIndex = this._modelState.navSel.albumIndex;
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
        this.albumTrackSelectionElem = document.getElementById('albumTrackSelection');
        this.albumElem = document.getElementById('album');
        this.trackElem = document.getElementById('track');
        this.loadAudioElem = document.getElementById('loadAudio');
        this.loadTextElem = document.getElementById('loadText');
        this.loadRandomElem = document.getElementById('loadRandom');
        this.shareLinkElem = document.getElementById('shareLink');
        this.playingTrackElem = document.getElementById('playingTrack');
        this.audioPlayerElem = document.getElementById('audioPlayer');
        this.displayingTrackElem = document.getElementById('displayingTrack');
        this.trackTextBodyElem = document.getElementById('trackTextBody');
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