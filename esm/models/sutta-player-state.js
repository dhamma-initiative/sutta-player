import { LocalStorageState } from '../runtime/localstorage-state.js';
export class SuttaSelection extends LocalStorageState {
    context;
    collectionIndex = 0;
    suttaIndex = -1;
    baseRef = null;
    constructor(ctx) {
        super();
        this.context = ctx;
    }
    read(src) {
        this.collectionIndex = src.collectionIndex;
        this.suttaIndex = src.suttaIndex;
        this.baseRef = src.baseRef;
    }
    updateBaseRef(qry) {
        this.baseRef = qry.querySuttaBaseReference(this.collectionIndex, this.suttaIndex);
    }
    save() {
        this._setItemNumber(`${this.context}.collectionIndex`, this.collectionIndex);
        this._setItemNumber(`${this.context}.suttaIndex`, this.suttaIndex);
        this._setItemString(`${this.context}.baseRef`, this.baseRef);
    }
    load() {
        this.collectionIndex = this._getItemNumber(`${this.context}.collectionIndex`, this.collectionIndex);
        this.suttaIndex = this._getItemNumber(`${this.context}.suttaIndex`, this.suttaIndex);
        this.baseRef = this._getItemString(`${this.context}.baseRef`, this.baseRef);
    }
}
export class SuttaPlayerState extends LocalStorageState {
    navSel = new SuttaSelection('navSel');
    textSel = new SuttaSelection('textSel');
    audioSel = new SuttaSelection('audioSel');
    autoPlay = false;
    playNext = false;
    repeat = false;
    linkTextToAudio = true;
    isDownloading = false;
    currentTime = 0;
    save() {
        this.navSel.save();
        this.textSel.save();
        this.audioSel.save();
        this._setItemBoolean('autoPlay', this.autoPlay);
        this._setItemBoolean('playNext', this.playNext);
        this._setItemBoolean('repeat', this.repeat);
        this._setItemBoolean('linkTextToAudio', this.linkTextToAudio);
        this._setItemNumber('currentTime', this.currentTime);
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
    }
}
//# sourceMappingURL=sutta-player-state.js.map