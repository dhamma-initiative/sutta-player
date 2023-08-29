export class SuttaPlayerView {
    collectionElem;
    suttaElem;
    loadAudioElem;
    loadTextElem;
    playingSuttaElem;
    autoPlayElem;
    playNextElem;
    repeatElem;
    linkTextToAudioElem;
    audioPlayerElem;
    suttaSummaryReferenceElem;
    suttaTextBodyElem;
    aboutSummaryReferenceElem;
    aboutTextBodyElem;
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
        this.suttaSummaryReferenceElem.innerHTML = `&#128083; ${this._playerState.textSel.baseRef}`;
        this.suttaTextBodyElem.innerHTML = textBody;
    }
    loadSuttaAudio() {
        if (this._playerState.audioSel.baseRef === null)
            return;
        const srcRef = this._audioStore.queryHtmlAudioSrcRef(this._playerState.audioSel.baseRef);
        this.audioPlayerElem.src = srcRef;
        this.audioPlayerElem.currentTime = this._playerState.currentTime;
    }
    updatePlayingSuttaInfo(baseRef, status) {
        let info = status ? ` [${status}]` : '';
        this.playingSuttaElem.innerHTML = `&#127911; ${baseRef}${info}`;
    }
    async toggleAboutInfo() {
        if (this.aboutTextBodyElem.innerHTML.trim() === '') {
            const textBody = await this._suttaStore.readTextFile('./README.md');
            this.aboutTextBodyElem.innerHTML = textBody + 'suttaplayer@gmail.com';
        }
        else
            this.aboutTextBodyElem.innerHTML = '';
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
        this.collectionElem = document.getElementById('collection');
        this.suttaElem = document.getElementById('sutta');
        this.loadAudioElem = document.getElementById('loadAudio');
        this.loadTextElem = document.getElementById('loadText');
        this.playingSuttaElem = document.getElementById('playingSutta');
        this.autoPlayElem = document.getElementById('autoPlay');
        this.playNextElem = document.getElementById('playNext');
        this.repeatElem = document.getElementById('repeat');
        this.linkTextToAudioElem = document.getElementById('linkTextToAudio');
        this.audioPlayerElem = document.getElementById('audioPlayer');
        this.suttaSummaryReferenceElem = document.getElementById('suttaSummaryReference');
        this.suttaTextBodyElem = document.getElementById('suttaTextBody');
        this.aboutSummaryReferenceElem = document.getElementById('aboutSummaryReference');
        this.aboutTextBodyElem = document.getElementById('aboutTextBody');
    }
}
//# sourceMappingURL=sutta-player-view.js.map