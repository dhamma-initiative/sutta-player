export class SuttaPlayerView {
    static LINEID_PREFIX = '_ln_';
    // settings
    autoPlayElem;
    playNextElem;
    repeatElem;
    linkTextToAudioElem;
    showLineNumsElem;
    darkThemeElem;
    searchAllAlbumsElem;
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
        this._loadAlbumsList();
        this.loadTracksList();
        await this.loadTrackText(cb);
        this.refreshAudioControls();
        this.loadTrackAudio();
        if (this._modelState.bookmarkLineNum > 0)
            this.scrollToLineNumber(this._modelState.bookmarkLineNum);
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
        this.searchAllAlbumsElem.checked = this._modelState.searchAllAlbums;
        this.useRegExElem.checked = this._modelState.useRegEx;
        this.ignoreDiacriticsElem.checked = this._modelState.ignoreDiacritics;
        this.processingProgressElem.value = 0;
        this.setColorTheme();
        this.toggleLineNums();
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
    async loadTrackText(cb) {
        if (this._modelState.textSel.baseRef === null)
            return;
        let textBody = await this._suttaStore.queryTrackText(this._modelState.textSel.baseRef);
        this.trackTextBodyElem.innerHTML = '';
        // this.trackTextBodyElem.innerHTML = textBody.replace(/^(.*)$/mg, "<span class=\"line\">$1</span>")
        let lines = textBody.split('\n');
        let totalCharLen = 0;
        let html = '';
        this._charPosLineIndex = [0];
        for (let i = 0; i < lines.length; i++) {
            html += `<span class=\"line\">${lines[i]}</span>\n`;
            totalCharLen += lines[i].length;
            this._charPosLineIndex.push(totalCharLen);
        }
        this.trackTextBodyElem.innerHTML = html;
        for (let i = 0; i < this.trackTextBodyElem.children.length; i++) {
            let elem = this.trackTextBodyElem.children[i];
            elem.id = SuttaPlayerView.createLineRefId(i + 1);
            elem.onclick = cb;
        }
        this.displayingTrackElem.innerHTML = `&#128064; ${this._modelState.textSel.baseRef}`;
    }
    setColorTheme() {
        let theme = this._modelState.darkTheme ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
    }
    scrollToLineNumber(lineNum) {
        let idRef = SuttaPlayerView.createLineRefId(lineNum);
        const elem = document.getElementById(idRef);
        if (elem)
            elem.scrollIntoView(true);
    }
    seekToTimePosition(charPos, charPerc, audDur) {
        let cont = Math.min(0.1 * audDur, 15);
        let seekTo = audDur * (charPerc / 100);
        this._modelState.currentTime = seekTo;
        this.audioPlayerElem.currentTime = this._modelState.currentTime;
    }
    syncTextPositionWithAudio() {
        if (!this._modelState.scrollTextWithAudio)
            return;
        if (this._modelState.audioSel.baseRef !== this._modelState.textSel.baseRef)
            return;
        if (this._charPosLineIndex.length < 1)
            return;
        let lineNum = this._estimateLineNumberFromAudio();
        let lineId = SuttaPlayerView.createLineRefId(lineNum);
        let elem = document.getElementById(lineId);
        if (elem) {
            // elem.scrollIntoView({block: 'center', behavior:'smooth'})
            const y = elem.offsetTop - (window.innerHeight / 2);
            window.scrollTo({ top: y, left: 0, behavior: 'smooth' });
        }
    }
    parseLineNumber(idRef) {
        let lnAsStr = idRef.replace(SuttaPlayerView.LINEID_PREFIX, '');
        let ret = parseInt(lnAsStr);
        return ret;
    }
    static createLineRefId(lineNum) {
        let idRef = `${SuttaPlayerView.LINEID_PREFIX}${lineNum}`;
        return idRef;
    }
    loadTrackAudio() {
        const success = this.loadSuttaAudioWith(this._modelState.audioSel, this.audioPlayerElem);
        if (success)
            this.audioPlayerElem.currentTime = this._modelState.currentTime;
    }
    loadSuttaAudioWith(trackSel, viewAudio) {
        if (trackSel.baseRef === null)
            return false;
        this._modelState.audioState = 0;
        const srcRef = this._audioStore.queryHtmlAudioSrcRef(trackSel.baseRef);
        viewAudio.src = srcRef;
        this._modelState.audioState = 1;
        return true;
    }
    updatePlayingTrackInfo(baseRef, status) {
        let info = status ? ` [${status}]` : '';
        this.playingTrackElem.innerHTML = `&#9835; ${baseRef}${info}`;
        // this.scrollTextWithAudioElem.style.display = (status === 'playing') ? 'block' : 'none'
        // this.scrollTextWithAudioElem.parentElement.style.display = (status === 'playing') ? 'block' : 'none'
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
            let albumName = this.albumElem.children[this.albumElem.selectedIndex].textContent;
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
        let disableActivityActions = true;
        if (this._modelState.stopDwnlDel === 1)
            actn = 'Downloading';
        else if (this._modelState.stopDwnlDel === 2)
            actn = 'Deleting';
        else if (this._modelState.stopDwnlDel === 0 && processingInfo === '' && perc === 0)
            disableActivityActions = false;
        this.processingInfoElem.textContent = `${actn} ${processingInfo}`;
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
        this.searchAllAlbumsElem = document.getElementById('searchAllAlbums');
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
        this.gotoTopElem = document.getElementById('gotoTop');
        this.snackbarElem = document.getElementById('snackbar');
    }
    _estimateLineNumberFromAudio() {
        let audioCurr = this.audioPlayerElem.currentTime;
        let audioTotal = this.audioPlayerElem.duration;
        let audioPerc = audioCurr / audioTotal;
        let totalCharLen = this._charPosLineIndex[this._charPosLineIndex.length - 1];
        let charPos = Math.max(Math.floor(audioPerc * totalCharLen), 1);
        let ret = this._charPosToLineNumber(charPos);
        return ret;
    }
    _charPosToLineNumber(charPos) {
        let ret = 1;
        for (let i = 1; i < this._charPosLineIndex.length; i++) {
            if (charPos >= this._charPosLineIndex[i - 1] && charPos < this._charPosLineIndex[i]) {
                ret = i;
                break;
            }
        }
        return ret;
    }
}
//# sourceMappingURL=sutta-player-view.js.map