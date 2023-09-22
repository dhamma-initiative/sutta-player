import { AlbumPlayerState, BookmarkedSelection } from '../models/album-player-state.js';
export class SuttaPlayerView {
    static LINEID_PREFIX = '_ln_';
    // settings
    autoPlayElem;
    playNextElem;
    repeatElem;
    linkTextToAudioElem;
    showLineNumsElem;
    searchScopeElem;
    darkThemeElem;
    showContextControlsElem;
    searchMenuElem;
    searchDialogElem;
    searchDialogCloseElem;
    useRegExElem;
    regExFlagsElem;
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
    // search
    searchForElem;
    searchSectionElem;
    searchSectionLabelElem;
    pauseSearchResultsElem;
    clearSearchResultsElem;
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
    concurrencyCountElem;
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
    _charPosLineIndex = [];
    constructor(mdl, albumStore) {
        this._model = mdl;
        this._albumStore = albumStore;
        this._bindHtmlElements();
    }
    async initialise(cb) {
        this.loadAlbumsList();
        await this.refreshTrackSelectionList();
        await this.loadTrackTextForUi(cb);
        this.refreshViewSettings();
        await this.loadTrackAudio();
        this._finaliseShareLinkLoadIfRqd();
    }
    refreshViewSettings() {
        this.autoPlayElem.checked = this._model.autoPlay;
        this.audioPlayerElem.autoplay = this._model.autoPlay;
        this.playNextElem.checked = this._model.playNext;
        this.repeatElem.checked = this._model.repeat;
        this.audioPlayerElem.loop = this._model.repeat;
        this.linkTextToAudioElem.checked = this._model.linkTextToAudio;
        this.scrollTextWithAudioElem.checked = this._model.scrollTextWithAudio;
        this.showLineNumsElem.checked = this._model.showLineNums;
        this.darkThemeElem.checked = this._model.darkTheme;
        this.showContextControlsElem.checked = this._model.showContextControls;
        this.searchForElem.value = this._model.searchFor;
        this.searchScopeElem.selectedIndex = this._model.searchScope;
        this.useRegExElem.checked = this._model.useRegEx;
        this.regExFlagsElem.value = this._model.regExFlags;
        this.ignoreDiacriticsElem.checked = this._model.ignoreDiacritics;
        this.concurrencyCountElem.selectedIndex = this._model.concurrencyCount;
        this.processingProgressElem.value = 0;
        this.setColorTheme();
        this.toggleLineNums();
        this.refreshSkipAudioToLine();
        this.showHideContextControls(this._model.showContextControls);
    }
    async refreshTrackSelectionList() {
        this.trackElem.innerHTML = '';
        const albIdx = this._model.navSel.albumIndex;
        const trkIdx = this._model.navSel.trackIndex;
        const trackLov = this._albumStore.queryTrackReferences(albIdx);
        let count = 0;
        this._albumStore.queryAlbumCacheStatus(albIdx, (baseRef, idx, taStatus, cargo) => {
            if (albIdx !== cargo.albumIndex)
                return;
            count++;
            const cachedChar = (taStatus[0] && taStatus[1]) ? '✔️' : (taStatus[1]) ? '🔊' : (taStatus[0]) ? '👀' : '◻';
            const option = document.createElement('option');
            option.value = `${idx}`;
            option.innerHTML = `${cachedChar} ${trackLov[idx]}`;
            this.trackElem.add(option, idx);
            if (count === trackLov.length)
                this.trackElem.selectedIndex = trkIdx;
        });
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
    async loadTrackAudio() {
        const success = await this.loadTrackAudioWith(this._model.audioSel, this.audioPlayerElem);
        if (success) {
            this.audioPlayerElem.currentTime = this._model.currentTime;
            if (this._model.bookmarkSel.isAwaitingLoad()) {
                if (this._model.currentTime > -1) {
                    // Uncaught (in promise) DOMException: play() failed because the user didn't interact with the document first. 
                    try {
                        await this.audioPlayerElem.play();
                    }
                    catch (err) { }
                }
            }
        }
    }
    async loadTrackAudioWith(trackSel, audioElem) {
        if (trackSel.baseRef === null)
            return false;
        this._model.audioState = 0;
        const srcRef = this._albumStore.queryTrackHtmlAudioSrcRef(trackSel.baseRef);
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
        const isCached = await this._albumStore.isInCache(this._model.navSel.baseRef, true, true);
        if (isCached[0] || isCached[1]) {
            this.removeAudioFromCacheElem.style.display = "block";
            this.removeAudioFromCacheElem.innerHTML = `Remove ${this._model.navSel.baseRef} from cache`;
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
        let actn = '';
        if (this._model.stopDwnlDel === 1)
            actn = 'Downloading';
        else if (this._model.stopDwnlDel === 2)
            actn = 'Deleting';
        this.processingInfoElem.textContent = `${actn} ${processingInfo}`;
        if (perc > -1)
            this.processingProgressElem.value = perc;
    }
    refreshSkipAudioToLine() {
        if (this._model.bookmarkSel.lineRef) {
            const vals = AlbumPlayerState.fromLineRef(this._model.bookmarkSel.lineRef);
            this.skipAudioToLineElem.innerHTML = `&nbsp;Line&nbsp;${vals[0]}&nbsp;⏫&nbsp;`;
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
            option.innerHTML = `${colLov[i]}`;
            this.albumElem.append(option);
        }
        this.albumElem.selectedIndex = this._model.navSel.albumIndex;
    }
    showHideContextControls(show) {
        if (this._model.showContextControls)
            show = this._model.showContextControls;
        const dispStyle = show ? 'block' : 'none';
        const sections = ['lhsFabSection', 'centreFabSection', 'rhsFabSection'];
        for (let i = 0; i < sections.length; i++) {
            const elem = document.getElementById(sections[i]);
            elem.style.display = dispStyle;
        }
    }
    _finaliseShareLinkLoadIfRqd() {
        if (this._model.bookmarkSel.isAwaitingLoad()) {
            if (this._model.bookmarkSel.endTime > -1)
                this._model.bookmarkSel.context = BookmarkedSelection.AWAITING_AUDIO_END;
            else
                this._model.bookmarkSel.context = BookmarkedSelection.CONTEXT;
        }
        if (this._model.bookmarkSel.lineRef) {
            const lineRefVals = AlbumPlayerState.fromLineRef(this._model.bookmarkSel.lineRef);
            this.scrollToTextLineNumber(lineRefVals[0], lineRefVals[1]);
        }
        else
            window.scroll(0, this._model.currentScrollY);
    }
    _bindHtmlElements() {
        this._bindSettingElements();
        this._bindNavigationElements();
        this._bindSearchElements();
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
        this.showContextControlsElem = document.getElementById('showContextControls');
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
    }
    _bindSearchElements() {
        this.searchMenuElem = document.getElementById('searchMenu');
        this.searchDialogElem = document.getElementById('searchDialog');
        this.searchDialogCloseElem = document.getElementById('searchDialogClose');
        this.searchForElem = document.getElementById('searchFor');
        this.searchResultsElem = document.getElementById('searchResults');
        this.searchSectionElem = document.getElementById('searchSection');
        this.searchSectionLabelElem = document.getElementById('searchSectionLabel');
        this.pauseSearchResultsElem = document.getElementById('pauseSearchResults');
        this.clearSearchResultsElem = document.getElementById('clearSearchResults');
        this.searchScopeElem = document.getElementById('searchScope');
        this.useRegExElem = document.getElementById('useRegEx');
        this.regExFlagsElem = document.getElementById('regExFlags');
        this.ignoreDiacriticsElem = document.getElementById('ignoreDiacritics');
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
        this.concurrencyCountElem = document.getElementById('concurrencyCount');
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