import { LocalStorageState } from '../runtime/localstorage-state.js';
export class TrackSelection extends LocalStorageState {
    context;
    albumIndex;
    trackIndex;
    baseRef;
    isLoaded = false;
    constructor(ctx, albIdx = 0, trkIdx = 0, bRef = null) {
        super();
        this.context = ctx;
        this.albumIndex = albIdx;
        this.trackIndex = trkIdx;
        this.baseRef = bRef;
    }
    read(src) {
        this.albumIndex = src.albumIndex;
        this.trackIndex = src.trackIndex;
        this.baseRef = src.baseRef;
    }
    updateBaseRef(qry) {
        this.baseRef = qry.queryTrackBaseRef(this.albumIndex, this.trackIndex);
    }
    isSimilar(toChk) {
        if (toChk.albumIndex !== this.albumIndex)
            return false;
        if (toChk.trackIndex !== this.trackIndex)
            return false;
        if (toChk.baseRef !== this.baseRef)
            return false;
        return true;
    }
    save() {
        this._setItemNumber(`${this.context}.albumIndex`, this.albumIndex);
        this._setItemNumber(`${this.context}.trackIndex`, this.trackIndex);
        this._setItemString(`${this.context}.baseRef`, this.baseRef);
    }
    restore() {
        this.albumIndex = this._getItemNumber(`${this.context}.albumIndex`, this.albumIndex);
        this.trackIndex = this._getItemNumber(`${this.context}.trackIndex`, this.trackIndex);
        this.baseRef = this._getItemString(`${this.context}.baseRef`, this.baseRef);
    }
}
export class SuttaPlayerState extends LocalStorageState {
    navSel = new TrackSelection('navSel');
    textSel = new TrackSelection('textSel');
    audioSel = new TrackSelection('audioSel');
    autoPlay = true;
    playNext = true;
    repeat = false;
    linkTextToAudio = true;
    showLineNums = true;
    currentScrollY = 0;
    currentTime = 0;
    darkTheme = false;
    searchFor = '';
    searchAllAlbums = false;
    useRegEx = false;
    ignoreDiacritics = true;
    audioState = -1; // transient [unspecified: -1, specified: 0, assigned: 1, loadedMetadata: 2, loaded: 3, playing: 4, paused: 5, ended: 6]
    stopDwnlDel = 0; // transient
    bookmarkLineRef = ''; // transient
    startSearch = false; // transient
    scrollTextWithAudio = false; // transient
    save() {
        this.navSel.save();
        this.textSel.save();
        this.audioSel.save();
        this._setItemBoolean('autoPlay', this.autoPlay);
        this._setItemBoolean('playNext', this.playNext);
        this._setItemBoolean('repeat', this.repeat);
        this._setItemBoolean('linkTextToAudio', this.linkTextToAudio);
        this._setItemBoolean('showLineNums', this.showLineNums);
        this._setItemNumber('currentScrollY', window.scrollY);
        this._setItemNumber('currentTime', this.currentTime);
        this._setItemBoolean('darkTheme', this.darkTheme);
        this._setItemString('searchFor', this.searchFor);
        this._setItemBoolean('searchAllAlbums', this.searchAllAlbums);
        this._setItemBoolean('useRegEx', this.useRegEx);
        this._setItemBoolean('ignoreDiacritics', this.ignoreDiacritics);
    }
    restore() {
        this.navSel.restore();
        this.textSel.restore();
        this.audioSel.restore();
        this.autoPlay = this._getItemBoolean('autoPlay', this.autoPlay);
        this.playNext = this._getItemBoolean('playNext', this.playNext);
        this.repeat = this._getItemBoolean('repeat', this.repeat);
        this.linkTextToAudio = this._getItemBoolean('linkTextToAudio', this.linkTextToAudio);
        this.showLineNums = this._getItemBoolean('showLineNums', this.showLineNums);
        this.currentTime = this._getItemNumber('currentTime', this.currentTime);
        this.currentScrollY = this._getItemNumber('currentScrollY', this.currentScrollY);
        this.darkTheme = this._getItemBoolean('darkTheme', this.darkTheme);
        this.searchFor = this._getItemString('searchFor', this.searchFor);
        this.searchAllAlbums = this._getItemBoolean('searchAllAlbums', this.searchAllAlbums);
        this.useRegEx = this._getItemBoolean('useRegEx', this.useRegEx);
        this.ignoreDiacritics = this._getItemBoolean('ignoreDiacritics', this.ignoreDiacritics);
    }
    static toLineRef(lineNum, begIdxPos, begPerc, endIdxPos, endPerc) {
        return `${lineNum}:${begIdxPos}:${begPerc.toFixed(3)}:${endIdxPos}:${endPerc.toFixed(3)}`;
    }
    static toLineRefUsingArr(refArr) {
        const ret = SuttaPlayerState.toLineRef(refArr[0], refArr[1], refArr[2], refArr[3], refArr[4]);
        return ret;
    }
    static fromLineRef(lineRef) {
        const vals = lineRef.split(':');
        return [Number(vals[0]), Number(vals[1]), Number(vals[2]), Number(vals[3]), Number(vals[4])];
    }
}
//# sourceMappingURL=sutta-player-state.js.map