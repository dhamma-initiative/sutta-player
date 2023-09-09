import { SuttaPlayerState } from '../models/sutta-player-state.js';
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
    audioCacherElem;
    // reset app
    resetAppDialogElem;
    resetAppCloseElem;
    resetAppConfirmElem;
    snackbarElem;
    scrollPlayToggleElem;
    skipAudioToLineElem;
    scrollTextWithAudioElem;
    gotoTopElem;
    _modelState;
    _suttaStore;
    _audioStore;
    _charPosLineIndex = [];
    constructor(mdl, store, audResolver) {
        this._modelState = mdl;
        this._suttaStore = store;
        this._audioStore = audResolver;
        this._bindHtmlElements();
    }
    async initialise(cb) {
        this.loadAlbumsList();
        this.loadTracksList();
        await this.loadTrackTextForUi(cb);
        this.refreshAudioControls();
        this.loadTrackAudio();
        if (this._modelState.bookmarkLineRef !== '') {
            const lineRefVals = SuttaPlayerState.fromLineRef(this._modelState.bookmarkLineRef);
            this.scrollToTextLineNumber(lineRefVals[0], lineRefVals[1]);
        }
        else
            window.scroll(0, this._modelState.currentScrollY);
    }
    refreshAudioControls() {
        this.autoPlayElem.checked = this._modelState.autoPlay;
        this.audioPlayerElem.autoplay = this._modelState.autoPlay;
        this.playNextElem.checked = this._modelState.playNext;
        this.repeatElem.checked = this._modelState.repeat;
        this.audioPlayerElem.loop = this._modelState.repeat;
        this.linkTextToAudioElem.checked = this._modelState.linkTextToAudio;
        this.scrollTextWithAudioElem.checked = this._modelState.scrollTextWithAudio;
        this.showLineNumsElem.checked = this._modelState.showLineNums;
        this.darkThemeElem.checked = this._modelState.darkTheme;
        this.searchForElem.value = this._modelState.searchFor;
        this.searchAlbumsElem.selectedIndex = this._modelState.searchAlbums;
        this.useRegExElem.checked = this._modelState.useRegEx;
        this.ignoreDiacriticsElem.checked = this._modelState.ignoreDiacritics;
        this.processingProgressElem.value = 0;
        this.setColorTheme();
        this.toggleLineNums();
        this.refreshSkipAudioToLine();
    }
    loadTracksList() {
        const trackLov = this._suttaStore.queryTrackReferences(this._modelState.navSel.albumIndex);
        this.trackElem.innerHTML = '';
        for (let i = 0; i < trackLov.length; i++) {
            const option = document.createElement('option');
            option.value = `${i}`;
            option.innerText = trackLov[i];
            this.trackElem.append(option);
        }
        this.trackElem.selectedIndex = this._modelState.navSel.trackIndex;
    }
    async loadTrackWith(trackSel) {
        if (trackSel.baseRef === null)
            return null;
        const ret = await this._suttaStore.queryTrackText(trackSel.baseRef);
        trackSel.isLoaded = true;
        return ret;
    }
    async loadTrackTextForUi(lineSelCb) {
        if (this._modelState.textSel.baseRef === null)
            return;
        const textBody = await this.loadTrackWith(this._modelState.textSel);
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
        this.displayingTrackElem.innerHTML = `&#128064; ${this._modelState.textSel.baseRef}`;
    }
    createLineRefValues(lineNum) {
        const totalCharLen = this._charPosLineIndex[this._charPosLineIndex.length - 1];
        const begIdxPos = this._charPosLineIndex[lineNum - 1];
        const begPerc = ((begIdxPos / totalCharLen) * 100);
        const endIdxPos = this._charPosLineIndex[lineNum];
        const endPerc = ((endIdxPos / totalCharLen) * 100);
        const ret = SuttaPlayerState.toLineRef(lineNum, begIdxPos, begPerc, endIdxPos, endPerc);
        return ret;
    }
    setColorTheme() {
        const theme = this._modelState.darkTheme ? 'dark' : 'light';
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
        this._modelState.currentTime = seekTo;
        this.audioPlayerElem.currentTime = this._modelState.currentTime;
    }
    syncTextPositionWithAudio() {
        if (!this._modelState.scrollTextWithAudio)
            return;
        if (this._modelState.audioSel.baseRef !== this._modelState.textSel.baseRef)
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
        const success = this.loadSuttaAudioWith(this._modelState.audioSel, this.audioPlayerElem);
        if (success)
            this.audioPlayerElem.currentTime = this._modelState.currentTime;
    }
    loadSuttaAudioWith(trackSel, audioElem) {
        if (trackSel.baseRef === null)
            return false;
        this._modelState.audioState = 0;
        const srcRef = this._audioStore.queryHtmlAudioSrcRef(trackSel.baseRef);
        audioElem.src = srcRef;
        this._modelState.audioState = 1;
        trackSel.isLoaded = true;
        return true;
    }
    updatePlayingTrackInfo(baseRef, status) {
        const info = status ? ` [${status}]` : '';
        this.playingTrackElem.innerHTML = `&#9835; ${baseRef}${info}`;
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
            let textBody = await this._suttaStore.readTextFile('./README.md');
            textBody = textBody.replaceAll('###', '-');
            textBody = textBody.replaceAll('#', '');
            this.aboutTextBodyElem.textContent = textBody + 'suttaplayer@gmail.com';
        }
        else
            this.aboutTextBodyElem.textContent = '';
        this.aboutDialogElem.open = !this.aboutDialogElem.open;
    }
    toggleOfflineDialog(event) {
        if (event)
            event.preventDefault();
        this.offlineDialogElem.open = !this.offlineDialogElem.open;
        if (!this.offlineDialogElem.open)
            return;
        if (this._modelState.stopDwnlDel === 0) {
            const albumName = this.albumElem.children[this.albumElem.selectedIndex].textContent;
            this.offlineTitleElem.textContent = albumName;
        }
        if (this._modelState.audioState === 1) { // stuck in assigned state
            this.removeAudioFromCacheElem.style.display = "block";
            this.removeAudioFromCacheElem.innerHTML = `Remove ${this._modelState.audioSel.baseRef} from cache`;
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
        if (this._modelState.stopDwnlDel === 1)
            actn = 'Downloading';
        else if (this._modelState.stopDwnlDel === 2)
            actn = 'Deleting';
        this.processingInfoElem.textContent = `${actn} ${processingInfo}`;
        this.processingProgressElem.value = perc;
    }
    refreshSkipAudioToLine() {
        if (this._modelState.bookmarkLineRef !== '') {
            const vals = SuttaPlayerState.fromLineRef(this._modelState.bookmarkLineRef);
            this.skipAudioToLineElem.innerHTML = `Line ${vals[0]} &#9193; &#9835;`;
            this.skipAudioToLineElem.style.display = 'block';
        }
        else
            this.skipAudioToLineElem.style.display = 'none';
    }
    loadAlbumsList() {
        this.albumElem.innerHTML = '';
        const colLov = this._suttaStore.queryAlbumNames();
        for (let i = 0; i < colLov.length; i++) {
            const option = document.createElement('option');
            option.value = `${i}`;
            const downChar = this._modelState.isAlbumDownloaded(i) ? '&#9745;' : '&#9744;';
            option.innerHTML = `${downChar} ${colLov[i]}`;
            this.albumElem.append(option);
        }
        this.albumElem.selectedIndex = this._modelState.navSel.albumIndex;
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
        this.audioCacherElem = document.getElementById('audioCacher');
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