import { AlbumPlayerState } from '../models/album-player-state.js';
export class SuttaPlayerView {
    static LINEID_PREFIX = '_ln_';
    // settings
    autoPlayElem;
    playNextElem;
    repeatElem;
    linkTextToAudioElem;
    showLineNumsElem;
    darkThemeElem;
    searchAlbumsElem;
    useRegExElem;
    ignoreDiacriticsElem;
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
    searchForElem;
    searchSectionElem;
    searchResultsElem;
    // display
    playingTrackElem;
    linkNavToAudioElem;
    audioPlayerElem;
    displayingTrackElem;
    linkNavToTextElem;
    trackTextBodyElem;
    // offline
    offlineDialogElem;
    offlineDialogCloseElem;
    offlineTitleElem;
    downloadAlbumElem;
    deleteAlbumElem;
    removeAudioFromCacheElem;
    processingInfoElem;
    processingProgressElem;
    // reset app
    resetAppDialogElem;
    resetAppCloseElem;
    resetAppConfirmElem;
    snackbarElem;
    scrollPlayToggleElem;
    skipAudioToLineElem;
    scrollTextWithAudioElem;
    gotoTopElem;
    _model;
    _albumStore;
    _audioStore;
    _charPosLineIndex = [];
    removeFromCacheBaseRef = null;
    constructor(mdl, albumStore, audioStore) {
        this._model = mdl;
        this._albumStore = albumStore;
        this._audioStore = audioStore;
        this._bindHtmlElements();
    }
    async initialise(cb) {
        this.loadAlbumsList();
        this.loadTracksList();
        await this.loadTrackTextForUi(cb);
        this.refreshAudioControls();
        this.loadTrackAudio();
        if (this._model.bookmarkLineRef !== '') {
            const lineRefVals = AlbumPlayerState.fromLineRef(this._model.bookmarkLineRef);
            this.scrollToTextLineNumber(lineRefVals[0], lineRefVals[1]);
        }
        else
            window.scroll(0, this._model.currentScrollY);
    }
    refreshAudioControls() {
        this.autoPlayElem.checked = this._model.autoPlay;
        this.audioPlayerElem.autoplay = this._model.autoPlay;
        this.playNextElem.checked = this._model.playNext;
        this.repeatElem.checked = this._model.repeat;
        this.audioPlayerElem.loop = this._model.repeat;
        this.linkTextToAudioElem.checked = this._model.linkTextToAudio;
        this.scrollTextWithAudioElem.checked = this._model.scrollTextWithAudio;
        this.showLineNumsElem.checked = this._model.showLineNums;
        this.darkThemeElem.checked = this._model.darkTheme;
        this.searchForElem.value = this._model.searchFor;
        this.searchAlbumsElem.selectedIndex = this._model.searchAlbums;
        this.useRegExElem.checked = this._model.useRegEx;
        this.ignoreDiacriticsElem.checked = this._model.ignoreDiacritics;
        this.processingProgressElem.value = 0;
        this.setColorTheme();
        this.toggleLineNums();
        this.refreshSkipAudioToLine();
    }
    loadTracksList() {
        const trackLov = this._albumStore.queryTrackReferences(this._model.navSel.albumIndex);
        this.trackElem.innerHTML = '';
        for (let i = 0; i < trackLov.length; i++) {
            const option = document.createElement('option');
            option.value = `${i}`;
            option.innerText = trackLov[i];
            this.trackElem.append(option);
        }
        this.trackElem.selectedIndex = this._model.navSel.trackIndex;
    }
    async loadTrackWith(trackSel) {
        if (trackSel.baseRef === null)
            return null;
        const ret = await this._albumStore.queryTrackText(trackSel.baseRef);
        trackSel.isLoaded = true;
        return ret;
    }
    async loadTrackTextForUi(lineSelCb) {
        if (this._model.textSel.baseRef === null)
            return;
        const textBody = await this.loadTrackWith(this._model.textSel);
        this.trackTextBodyElem.innerHTML = '';
        const lines = textBody.split('\n');
        let totalCharLen = 0;
        let html = '';
        this._charPosLineIndex = [0];
        for (let i = 0; i < lines.length; i++) {
            html += `<span class=\"line\">${lines[i]}</span>\n`;
            totalCharLen += lines[i].length + ((i === lines.length - 1) ? 0 : 1);
            this._charPosLineIndex.push(totalCharLen);
        }
        this.trackTextBodyElem.innerHTML = html;
        for (let i = 0; i < this.trackTextBodyElem.children.length; i++) {
            const elem = this.trackTextBodyElem.children[i];
            elem.id = SuttaPlayerView.createLineElementId(i + 1);
            elem.onclick = lineSelCb;
        }
        this.displayingTrackElem.innerHTML = `${this._model.textSel.baseRef}`;
    }
    createLineRefValues(lineNum) {
        const totalCharLen = this._charPosLineIndex[this._charPosLineIndex.length - 1];
        const begIdxPos = this._charPosLineIndex[lineNum - 1];
        const begPerc = ((begIdxPos / totalCharLen) * 100);
        const endIdxPos = this._charPosLineIndex[lineNum];
        const endPerc = ((endIdxPos / totalCharLen) * 100);
        const ret = AlbumPlayerState.toLineRef(lineNum, begIdxPos, begPerc, endIdxPos, endPerc);
        return ret;
    }
    setColorTheme() {
        const theme = this._model.darkTheme ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
    }
    scrollToTextLineNumber(lineNum, idxPos) {
        const idRef = SuttaPlayerView.createLineElementId(lineNum);
        let offset = -window.innerHeight / 2;
        const elem = document.getElementById(idRef);
        if (idxPos > -1) {
            const lnPerc = this._charPosToLineNumPercOffset(idxPos);
            if (lnPerc[0] === lineNum) {
                const spanRect = elem.getBoundingClientRect();
                const scrollY = window.scrollY || window.pageYOffset;
                const top = spanRect.top + scrollY;
                offset += top + Math.round(spanRect.height * lnPerc[1]);
            }
        }
        if (elem)
            window.scroll({ top: offset, behavior: "smooth" });
    }
    scrollToTextPercCentred(perc) {
        const totalLen = this._charPosLineIndex[this._charPosLineIndex.length - 1];
        const idxPos = (totalLen * perc / 100);
        const lnPerc = this._charPosToLineNumPercOffset(idxPos);
        this.scrollToTextLineNumber(lnPerc[0], idxPos);
    }
    seekToTimePosition(charPos, charPerc, audDur) {
        const seekTo = audDur * (charPerc / 100);
        this._model.currentTime = seekTo;
        this.audioPlayerElem.currentTime = this._model.currentTime;
    }
    syncTextPositionWithAudio() {
        if (!this._model.scrollTextWithAudio)
            return;
        if (this._model.audioSel.baseRef !== this._model.textSel.baseRef)
            return;
        const posPerc = this._getAudioPositionAsPerc();
        this.scrollToTextPercCentred(posPerc);
    }
    parseLineNumber(idRef) {
        const lnAsStr = idRef.replace(SuttaPlayerView.LINEID_PREFIX, '');
        const ret = parseInt(lnAsStr);
        return ret;
    }
    static createLineElementId(lineNum) {
        const idRef = `${SuttaPlayerView.LINEID_PREFIX}${lineNum}`;
        return idRef;
    }
    loadTrackAudio() {
        const success = this.loadTrackAudioWith(this._model.audioSel, this.audioPlayerElem);
        if (success)
            this.audioPlayerElem.currentTime = this._model.currentTime;
    }
    loadTrackAudioWith(trackSel, audioElem) {
        if (trackSel.baseRef === null)
            return false;
        this._model.audioState = 0;
        const srcRef = this._audioStore.queryHtmlAudioSrcRef(trackSel.baseRef);
        audioElem.src = srcRef;
        this._model.audioState = 1;
        trackSel.isLoaded = true;
        return true;
    }
    updatePlayingTrackInfo(baseRef, status) {
        const info = status ? ` [${status}]` : '';
        this.playingTrackElem.innerHTML = `${baseRef}${info}`;
    }
    showMessage(msg, dur = 3000) {
        this.snackbarElem.textContent = msg;
        this.snackbarElem.classList.add('show');
        setTimeout(() => {
            this.snackbarElem.classList.remove('show');
        }, dur);
    }
    toggleLineNums() {
        if (this.showLineNumsElem.checked)
            this.trackTextBodyElem.classList.add('displayLineNums');
        else
            this.trackTextBodyElem.classList.remove('displayLineNums');
    }
    async toggleAboutInfo(event) {
        if (event)
            event.preventDefault();
        if (this.aboutTextBodyElem.textContent.trim() === '') {
            let textBody = await this._albumStore.readTextFile('./README.md');
            textBody = textBody.replaceAll('###', '-');
            textBody = textBody.replaceAll('#', '');
            this.aboutTextBodyElem.textContent = textBody + 'suttaplayer@gmail.com';
        }
        else
            this.aboutTextBodyElem.textContent = '';
        this.aboutDialogElem.open = !this.aboutDialogElem.open;
    }
    async toggleOfflineDialog(event) {
        if (event)
            event.preventDefault();
        this.offlineDialogElem.open = !this.offlineDialogElem.open;
        if (!this.offlineDialogElem.open)
            return;
        if (this._model.stopDwnlDel === 0) {
            const albumName = this.albumElem.children[this.albumElem.selectedIndex].textContent;
            this.offlineTitleElem.textContent = albumName;
        }
        const isCached = await this._audioStore.isInCache(this._model.navSel.baseRef);
        if (isCached) {
            this.removeFromCacheBaseRef = this._model.navSel.baseRef;
            this.removeAudioFromCacheElem.style.display = "block";
            this.removeAudioFromCacheElem.innerHTML = `Remove ${this.removeFromCacheBaseRef} from cache`;
        }
        else
            this.removeAudioFromCacheElem.style.display = "none";
    }
    toggleResetAppDialog(event) {
        if (event)
            event.preventDefault();
        this.resetAppDialogElem.open = !this.resetAppDialogElem.open;
    }
    updateOfflineInfo(processingInfo, perc) {
        let actn = 'Choose an action above';
        if (this._model.stopDwnlDel === 1)
            actn = 'Downloading';
        else if (this._model.stopDwnlDel === 2)
            actn = 'Deleting';
        this.processingInfoElem.textContent = `${actn} ${processingInfo}`;
        this.processingProgressElem.value = perc;
    }
    refreshSkipAudioToLine() {
        if (this._model.bookmarkLineRef !== '') {
            const vals = AlbumPlayerState.fromLineRef(this._model.bookmarkLineRef);
            this.skipAudioToLineElem.innerHTML = `Line ${vals[0]} &#9193;`;
            this.skipAudioToLineElem.style.display = 'block';
        }
        else
            this.skipAudioToLineElem.style.display = 'none';
    }
    loadAlbumsList() {
        this.albumElem.innerHTML = '';
        const colLov = this._albumStore.queryAlbumNames();
        for (let i = 0; i < colLov.length; i++) {
            const option = document.createElement('option');
            option.value = `${i}`;
            const downChar = this._model.isAlbumDownloaded(i) ? '&#9745;' : '&#9744;';
            option.innerHTML = `${downChar} ${colLov[i]}`;
            this.albumElem.append(option);
        }
        this.albumElem.selectedIndex = this._model.navSel.albumIndex;
    }
    _bindHtmlElements() {
        this._bindSettingElements();
        this._bindNavigationElements();
        this._bindDisplayElements();
        this._bindOfflineElements();
        this._bindResetAppElements();
        this._bindAboutElements();
        this._bindMiscElements();
    }
    _bindSettingElements() {
        this.autoPlayElem = document.getElementById('autoPlay');
        this.playNextElem = document.getElementById('playNext');
        this.repeatElem = document.getElementById('repeat');
        this.linkTextToAudioElem = document.getElementById('linkTextToAudio');
        this.showLineNumsElem = document.getElementById('showLineNums');
        this.darkThemeElem = document.getElementById('darkTheme');
        this.searchAlbumsElem = document.getElementById('searchAlbums');
        this.useRegExElem = document.getElementById('useRegEx');
        this.ignoreDiacriticsElem = document.getElementById('ignoreDiacritics');
        this.offlineMenuElem = document.getElementById('offlineMenu');
        this.resetAppMenuElem = document.getElementById('resetAppMenu');
    }
    _bindNavigationElements() {
        this.albumTrackSelectionElem = document.getElementById('albumTrackSelection');
        this.albumElem = document.getElementById('album');
        this.trackElem = document.getElementById('track');
        this.loadAudioElem = document.getElementById('loadAudio');
        this.loadTextElem = document.getElementById('loadText');
        this.loadRandomElem = document.getElementById('loadRandom');
        this.shareLinkElem = document.getElementById('shareLink');
        this.searchForElem = document.getElementById('searchFor');
        this.searchSectionElem = document.getElementById('searchSection');
        this.searchResultsElem = document.getElementById('searchResults');
    }
    _bindDisplayElements() {
        this.playingTrackElem = document.getElementById('playingTrack');
        this.audioPlayerElem = document.getElementById('audioPlayer');
        this.linkNavToAudioElem = document.getElementById('linkNavToAudio');
        this.displayingTrackElem = document.getElementById('displayingTrack');
        this.trackTextBodyElem = document.getElementById('trackTextBody');
        this.linkNavToTextElem = document.getElementById('linkNavToText');
    }
    _bindOfflineElements() {
        this.offlineDialogElem = document.getElementById('offlineDialog');
        this.offlineDialogCloseElem = document.getElementById('offlineDialogClose');
        this.offlineTitleElem = document.getElementById('offlineTitle');
        this.downloadAlbumElem = document.getElementById('downloadAlbum');
        this.deleteAlbumElem = document.getElementById('deleteAlbum');
        this.removeAudioFromCacheElem = document.getElementById('removeAudioFromCache');
        this.processingInfoElem = document.getElementById('processingInfo');
        this.processingProgressElem = document.getElementById('processingProgress');
    }
    _bindResetAppElements() {
        this.resetAppDialogElem = document.getElementById('resetAppDialog');
        this.resetAppCloseElem = document.getElementById('resetAppClose');
        this.resetAppConfirmElem = document.getElementById('resetAppConfirm');
    }
    _bindAboutElements() {
        this.aboutMenuElem = document.getElementById('aboutMenu');
        this.aboutDialogElem = document.getElementById('aboutDialog');
        this.aboutDialogCloseElem = document.getElementById('aboutDialogClose');
        this.aboutTextBodyElem = document.getElementById('aboutTextBody');
    }
    _bindMiscElements() {
        this.scrollPlayToggleElem = document.getElementById('scrollPlayToggle');
        this.scrollTextWithAudioElem = document.getElementById('scrollTextWithAudio');
        this.skipAudioToLineElem = document.getElementById('skipAudioToLine');
        this.gotoTopElem = document.getElementById('gotoTop');
        this.snackbarElem = document.getElementById('snackbar');
    }
    _getAudioPositionAsPerc() {
        const audioCurr = this.audioPlayerElem.currentTime;
        const audioTotal = this.audioPlayerElem.duration;
        const audioPerc = audioCurr / audioTotal;
        return 100 * audioPerc;
    }
    _charPosToLineNumPercOffset(idxPos) {
        const ret = [1, 0];
        for (let i = 1; i < this._charPosLineIndex.length; i++) {
            if (idxPos >= this._charPosLineIndex[i - 1] && idxPos < this._charPosLineIndex[i]) {
                ret[0] = i;
                const diff = idxPos - this._charPosLineIndex[i - 1];
                const total = this._charPosLineIndex[i] - this._charPosLineIndex[i - 1];
                ret[1] = diff / total;
                break;
            }
        }
        return ret;
    }
}
//# sourceMappingURL=sutta-player-view.js.map