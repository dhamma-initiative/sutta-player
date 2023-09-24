import { LocalStorageState } from '../runtime/localstorage-state.js';
export class TrackSelection extends LocalStorageState {
    context;
    albumIndex;
    trackIndex;
    baseRef;
    dictionary = {};
    isLoaded = false; // transient
    constructor(ctx, albIdx = 0, trkIdx = 0, bRef = null) {
        super();
        this.reset(ctx, albIdx, trkIdx, bRef);
    }
    read(src) {
        let ret = false;
        if (this.albumIndex !== src.albumIndex) {
            this.albumIndex = src.albumIndex;
            ret = true;
        }
        if (this.trackIndex !== src.trackIndex) {
            this.trackIndex = src.trackIndex;
            ret = true;
        }
        if (this.baseRef !== src.baseRef) {
            this.baseRef = src.baseRef;
            this._refreshDictionary();
            ret = true;
        }
        this.isLoaded = false;
        return ret;
    }
    async updateBaseRef(qry) {
        this.baseRef = await qry.queryTrackBaseRef(this.albumIndex, this.trackIndex);
        this._refreshDictionary();
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
    reset(ctx = null, albIdx = 0, trkIdx = 0, bRef = null) {
        this.context = ctx;
        this.albumIndex = albIdx;
        this.trackIndex = trkIdx;
        this.baseRef = bRef;
        this.dictionary = {};
        this.isLoaded = false;
        this._refreshDictionary();
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
        this._refreshDictionary();
    }
    _refreshDictionary() {
        if (this.baseRef !== null) {
            const idxPos = this.baseRef.lastIndexOf('/');
            if (idxPos > -1) {
                this.dictionary['albumRef'] = this.baseRef.substring(0, idxPos);
                this.dictionary['trackName'] = this.baseRef.substring(idxPos + 1);
            }
            else {
                this.dictionary['albumRef'] = this.baseRef;
                this.dictionary['trackName'] = '';
            }
        }
    }
}
export class BookmarkedSelection extends TrackSelection {
    static CONTEXT = 'url';
    static ONLOAD = 'onload_url';
    static AWAITING_AUDIO_END = 'awaiting_audio_end';
    static BUILD = 'build';
    appRoot;
    startTime;
    endTime;
    lineRef;
    constructor(root = '/', ctx = BookmarkedSelection.CONTEXT, albIdx = 0, trkIdx = 0, bRef = null) {
        super(ctx, albIdx, trkIdx, bRef);
        this.appRoot = root;
        this.reset(ctx, albIdx, trkIdx, bRef);
    }
    read(src) {
        let ret = super.read(src);
        if (ret) {
            this.startTime = -1;
            this.endTime = -1;
            this.lineRef = null;
        }
        return ret;
    }
    reset(ctx = BookmarkedSelection.CONTEXT, albIdx = 0, trkIdx = 0, bRef = null) {
        super.reset(ctx, albIdx, trkIdx, bRef);
        this.startTime = -1;
        this.endTime = -1;
        this.lineRef = null;
    }
    set(st, et, lr) {
        this.context = BookmarkedSelection.CONTEXT;
        if (st !== null)
            this.startTime = st;
        if (et !== null)
            this.endTime = et;
        if (lr !== null)
            this.lineRef = lr;
    }
    createLink() {
        let ret = location.protocol + '//' + location.host + this.appRoot + '#' + this.baseRef + '?';
        if (this.startTime > -1)
            ret += `startTime=${this.startTime}`;
        if (this.endTime > -1) {
            const amp = ret.endsWith('?') ? '' : '&';
            ret += `${amp}endTime=${this.endTime}`;
        }
        if (this.lineRef !== null) {
            const amp = ret.endsWith('?') ? '' : '&';
            ret += `${amp}lineRef=${this.lineRef}`;
        }
        return ret;
    }
    async parseLink(qry) {
        let href = location.href;
        let url = new URL(href);
        if (url.hash) {
            href = href.replace('#', '');
            url = new URL(href);
            let baseRef = url.pathname.substring(this.appRoot.length);
            if (baseRef.startsWith('/'))
                baseRef = baseRef.substring(1);
            const urlSel = await qry.queryTrackSelection(baseRef);
            if (urlSel.albumIndex > -1 && urlSel.trackIndex > -1) {
                this.read(urlSel);
                const st = url.searchParams.get('startTime');
                const et = url.searchParams.get('endTime');
                const lr = url.searchParams.get('lineRef');
                this.set(st !== null ? Number(st) : null, et !== null ? Number(et) : null, lr);
                this.context = BookmarkedSelection.ONLOAD;
            }
        }
    }
    isAwaitingLoad() {
        return this.context === BookmarkedSelection.ONLOAD;
    }
    isAwaitingAudioEnd() {
        return this.context === BookmarkedSelection.AWAITING_AUDIO_END;
    }
    cancelAwaitingAudioEndIfRqd() {
        if (this.isAwaitingAudioEnd())
            this.context = BookmarkedSelection.CONTEXT;
    }
}
export class AlbumPlayerState extends LocalStorageState {
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
    searchScope = 0; // [selected album: 0, cached tracks: 1, all albums: 2]
    useRegEx = false;
    regExFlags = 'gm';
    ignoreDiacritics = true;
    concurrencyCount = 0;
    audioState = -1; // transient [unspecified: -1, specified: 0, assigned: 1, loadedMetadata: 2, loaded: 3, playing: 4, paused: 5, ended: 6]
    stopDwnlDel = 0; // transient
    bookmarkSel; // transient
    startSearch = false; // transient
    scrollTextWithAudio = false; // transient
    constructor(bmSel) {
        super();
        this.bookmarkSel = bmSel;
    }
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
        this._setItemNumber('concurrencyCount', this.concurrencyCount);
        this._setItemString('searchFor', this.searchFor);
        this._setItemNumber('searchScope', this.searchScope);
        this._setItemBoolean('useRegEx', this.useRegEx);
        this._setItemString('regExFlags', this.regExFlags);
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
        this.concurrencyCount = this._getItemNumber('concurrencyCount', this.concurrencyCount);
        this.searchFor = this._getItemString('searchFor', this.searchFor);
        this.searchScope = this._getItemNumber('searchScope', this.searchScope);
        this.useRegEx = this._getItemBoolean('useRegEx', this.useRegEx);
        this.regExFlags = this._getItemString('regExFlags', this.regExFlags);
        this.ignoreDiacritics = this._getItemBoolean('ignoreDiacritics', this.ignoreDiacritics);
    }
    static toLineRef(lineNum, begIdxPos, begPerc, endIdxPos, endPerc) {
        return `${lineNum}:${begIdxPos}:${begPerc.toFixed(3)}:${endIdxPos}:${endPerc.toFixed(3)}`;
    }
    static toLineRefUsingArr(refArr) {
        const ret = AlbumPlayerState.toLineRef(refArr[0], refArr[1], refArr[2], refArr[3], refArr[4]);
        return ret;
    }
    static fromLineRef(lineRef) {
        const vals = lineRef.split(':');
        return [Number(vals[0]), Number(vals[1]), Number(vals[2]), Number(vals[3]), Number(vals[4])];
    }
}
//# sourceMappingURL=album-player-state.js.map