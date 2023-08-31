export class SuttaPlayerView {
    // settings
    autoPlayElem;
    playNextElem;
    repeatElem;
    linkTextToAudioElem;
    toggleDownloadElem;
    downloadProgressElem;
    audioCacherElem;
    resetAppElem;
    // about
    showAboutElem;
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
    _playerState;
    _suttaStore;
    _audioStore;
    constructor(mdl, store, audResolver) {
        this._playerState = mdl;
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
        this.autoPlayElem.checked = this._playerState.autoPlay;
        this.audioPlayerElem.autoplay = this._playerState.autoPlay;
        this.playNextElem.checked = this._playerState.playNext;
        this.repeatElem.checked = this._playerState.repeat;
        this.linkTextToAudioElem.checked = this._playerState.linkTextToAudio;
        this.audioPlayerElem.loop = this._playerState.repeat;
        this.downloadProgressElem.value = 0;
        this.toggleDownloadElem.checked = this._playerState.isDownloading;
    }
    loadSuttasList() {
        const suttaLov = this._suttaStore.querySuttaReferences(this._playerState.navSel.collectionIndex);
        this.suttaElem.selectedIndex = -1;
        this.suttaElem.innerHTML = '';
        for (let i = 0; i < suttaLov.length; i++) {
            let option = document.createElement('option');
            option.value = `${i}`;
            if (i === this._playerState.navSel.suttaIndex)
                option.selected = true;
            option.innerText = suttaLov[i];
            this.suttaElem.append(option);
        }
    }
    async loadSuttaText() {
        if (this._playerState.textSel.baseRef === null)
            return;
        const textBody = await this._suttaStore.querySuttaText(this._playerState.textSel.baseRef);
        this.suttaTextBodyElem.innerHTML = textBody;
        this.displayingSuttaElem.innerHTML = `&#128083; ${this._playerState.textSel.baseRef}`;
    }
    loadSuttaAudio() {
        const success = this.loadSuttaAudioWith(this._playerState.audioSel, this.audioPlayerElem);
        if (success)
            this.audioPlayerElem.currentTime = this._playerState.currentTime;
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
        let isOpen = false;
        if (this.aboutTextBodyElem.innerHTML.trim() === '') {
            isOpen = true;
            let textBody = await this._suttaStore.readTextFile('./README.md');
            textBody = textBody.replaceAll('###', '-');
            textBody = textBody.replaceAll('#', '');
            this.aboutTextBodyElem.innerHTML = textBody + 'suttaplayer@gmail.com';
        }
        else
            this.aboutTextBodyElem.innerHTML = '';
        this.aboutDialogElem.open = isOpen;
        event.preventDefault();
    }
    _loadCollectionsList() {
        const colLov = this._suttaStore.queryCollectionNames();
        for (let i = 0; i < colLov.length; i++) {
            let option = document.createElement('option');
            option.value = `${i}`;
            if (i === this._playerState.navSel.collectionIndex)
                option.selected = true;
            option.innerText = colLov[i];
            this.collectionElem.append(option);
        }
    }
    _bindHtmlElements() {
        this.autoPlayElem = document.getElementById('autoPlay');
        this.playNextElem = document.getElementById('playNext');
        this.repeatElem = document.getElementById('repeat');
        this.linkTextToAudioElem = document.getElementById('linkTextToAudio');
        this.toggleDownloadElem = document.getElementById('toggleDownload');
        this.downloadProgressElem = document.getElementById('downloadProgress');
        this.audioCacherElem = document.getElementById('audioCacher');
        this.resetAppElem = document.getElementById('resetApp');
        this.showAboutElem = document.getElementById('showAbout');
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
    }
}
//# sourceMappingURL=sutta-player-view.js.map