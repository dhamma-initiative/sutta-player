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
    currentTime = 0;
    colorTheme = 'light';
    stopDwnlDel = 0; // transient
    save() {
        this.navSel.save();
        this.textSel.save();
        this.audioSel.save();
        this._setItemBoolean('autoPlay', this.autoPlay);
        this._setItemBoolean('playNext', this.playNext);
        this._setItemBoolean('repeat', this.repeat);
        this._setItemBoolean('linkTextToAudio', this.linkTextToAudio);
        this._setItemNumber('currentTime', this.currentTime);
        this._setItemString('colorTheme', this.colorTheme);
    }
    load() {
        this.navSel.load();
        this.textSel.load();
        this.audioSel.load();
        this.autoPlay = this._getItemBoolean('autoPlay', this.autoPlay);
        this.playNext = this._getItemBoolean('playNext', this.playNext);
        this.repeat = this._getItemBoolean('repeat', this.repeat);
        this.linkTextToAudio = this._getItemBoolean('linkTextToAudio', this.linkTextToAudio);
        this.currentTime = this._getItemNumber('currentTime', this.currentTime);
        this.colorTheme = this._getItemString('colorTheme', this.colorTheme);
    }
}
//# sourceMappingURL=sutta-player-state.js.map