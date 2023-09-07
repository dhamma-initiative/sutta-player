import { LocalStorageState } from '../runtime/localstorage-state.js';
export class TrackSelection extends LocalStorageState {
    context;
    albumIndex;
    trackIndex;
    baseRef;
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
    save() {
        this._setItemNumber(`${this.context}.albumIndex`, this.albumIndex);
        this._setItemNumber(`${this.context}.trackIndex`, this.trackIndex);
        this._setItemString(`${this.context}.baseRef`, this.baseRef);
    }
    load() {
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
    bookmarkLineNum = 0; // trainsient
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
    load() {
        this.navSel.load();
        this.textSel.load();
        this.audioSel.load();
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
}
//# sourceMappingURL=sutta-player-state.js.map