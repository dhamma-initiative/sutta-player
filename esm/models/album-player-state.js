import { LocalStorageState } from '../runtime/localstorage-state.js';
export class TrackSelection extends LocalStorageState {
    context;
    albumIndex;
    trackIndex;
    baseRef;
    startTime;
    stopTime;
    lineRef;
    dictionary = {}; // transient
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
        if (this.startTime !== src.startTime) {
            this.startTime = src.startTime;
            ret = true;
        }
        if (this.stopTime !== src.stopTime) {
            this.stopTime = src.stopTime;
            ret = true;
        }
        if (this.lineRef !== src.lineRef) {
            this.lineRef = src.lineRef;
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
    setDetails(lr, st, et) {
        this.lineRef = lr;
        if (st !== null)
            this.startTime = st;
        if (et !== null)
            this.stopTime = et;
    }
    _prepareSaveIntoJson() {
        let json = { albumIndex: this.albumIndex, trackIndex: this.trackIndex, baseRef: this.baseRef };
        if (this.lineRef)
            json = { ...json, lineRef: this.lineRef };
        if (this.startTime !== null && this.startTime !== -1)
            json = { ...json, startTime: this.startTime };
        if (this.stopTime !== null && this.stopTime !== -1)
            json = { ...json, stopTime: this.stopTime };
        return json;
    }
    save() {
        const json = this._prepareSaveIntoJson();
        this._setItemJson(this.context, json);
    }
    _prepareRestoreFromJson(json) {
        const { source: source, albumIndex: albumIndex, trackIndex: trackIndex, baseRef: baseRef } = json;
        if (albumIndex)
            this.albumIndex = albumIndex;
        if (trackIndex)
            this.trackIndex = trackIndex;
        if (baseRef)
            this.baseRef = baseRef;
        const { lineRef: lineRef, startTime: startTime, stopTime: stopTime } = json;
        if (lineRef)
            this.lineRef = lineRef;
        if (startTime)
            this.startTime = startTime;
        if (stopTime)
            this.stopTime = stopTime;
    }
    restore() {
        const json = this._getItemJson(this.context, {});
        this._prepareRestoreFromJson(json);
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
    constructor(root = '/', ctx = BookmarkedSelection.CONTEXT, albIdx = 0, trkIdx = 0, bRef = null) {
        super(ctx, albIdx, trkIdx, bRef);
        this.appRoot = root;
        this.reset(ctx, albIdx, trkIdx, bRef);
    }
    read(src) {
        this.startTime = -1;
        this.stopTime = -1;
        this.lineRef = null;
        let ret = super.read(src);
        return ret;
    }
    reset(ctx = BookmarkedSelection.CONTEXT, albIdx = 0, trkIdx = 0, bRef = null) {
        super.reset(ctx, albIdx, trkIdx, bRef);
        this.setDetails(null, -1, -1);
    }
    setDetails(lr, st, et) {
        this.context = BookmarkedSelection.CONTEXT;
        super.setDetails(lr, st, et);
    }
    createLink() {
        let ret = location.protocol + '//' + location.host + this.appRoot + '#' + this.baseRef + '?';
        if (this.startTime > -1)
            ret += `startTime=${this.startTime}`;
        if (this.stopTime > -1) {
            const amp = ret.endsWith('?') ? '' : '&';
            ret += `${amp}stopTime=${this.stopTime}`;
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
                const et = url.searchParams.get('stopTime');
                const lr = url.searchParams.get('lineRef');
                this.setDetails(lr, st !== null ? Number(st) : null, et !== null ? Number(et) : null);
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
    catSel = new TrackSelection('catalogSel');
    playlistSel = new TrackSelection('playlistSel');
    homeSel = new TrackSelection('homeSel');
    playlists = [];
    currentPlaylist;
    autoPlay = true;
    playNext = true;
    repeat = false;
    scrollTextWithAudio = false;
    loadAudioWithText = true;
    showLineNums = true;
    currentScrollY = 0;
    currentTime = 0;
    darkTheme = false;
    searchFor = '';
    searchScope = 0; // [selected album: 0, cached tracks: 1, all albums: 2]
    useRegEx = false;
    applyAndBetweenTerms = true;
    regExFlags = 'gm';
    ignoreDiacritics = true;
    concurrencyCount = 0;
    lastPlaylistIterator = null;
    playlistIterator;
    stopDwnlDel = 0; // transient
    bookmarkSel; // transient
    startSearch = false; // transient
    _audioState = -1; // transient [unspecified: -1, specified: 0, assigned: 1, loadedMetadata: 2, loaded: 3, playing: 4, paused: 5, ended: 6]
    onAudioStateChange;
    constructor(bmSel) {
        super();
        this.bookmarkSel = bmSel;
    }
    save() {
        this.catSel.save();
        this.homeSel.save();
        this.playlistSel.save();
        this._setItemBoolean('autoPlay', this.autoPlay);
        this._setItemBoolean('playNext', this.playNext);
        this._setItemBoolean('repeat', this.repeat);
        this._setItemBoolean('scrollTextWithAudio', this.scrollTextWithAudio);
        this._setItemBoolean('loadAudioWithText', this.loadAudioWithText);
        this._setItemBoolean('showLineNums', this.showLineNums);
        this._setItemNumber('currentScrollY', window.scrollY);
        this._setItemNumber('currentTime', this.currentTime);
        this._setItemBoolean('darkTheme', this.darkTheme);
        this._setItemNumber('concurrencyCount', this.concurrencyCount);
        this._setItemString('lastPlaylistIterator', this.lastPlaylistIterator);
        this._setItemString('searchFor', this.searchFor);
        this._setItemNumber('searchScope', this.searchScope);
        this._setItemBoolean('useRegEx', this.useRegEx);
        this._setItemString('regExFlags', this.regExFlags);
        this._setItemBoolean('applyAndBetweenTerms', this.applyAndBetweenTerms);
        this._setItemBoolean('ignoreDiacritics', this.ignoreDiacritics);
        this.playlists.sort((a, b) => a.name.localeCompare(b.name));
        this._setItemJson('playLists', this.playlists);
    }
    restore() {
        this.catSel.restore();
        this.homeSel.restore();
        this.playlistSel.restore();
        this.autoPlay = this._getItemBoolean('autoPlay', this.autoPlay);
        this.playNext = this._getItemBoolean('playNext', this.playNext);
        this.repeat = this._getItemBoolean('repeat', this.repeat);
        this.scrollTextWithAudio = this._getItemBoolean('scrollTextWithAudio', this.scrollTextWithAudio);
        this.loadAudioWithText = this._getItemBoolean('loadAudioWithText', this.loadAudioWithText);
        this.showLineNums = this._getItemBoolean('showLineNums', this.showLineNums);
        this.currentTime = this._getItemNumber('currentTime', this.currentTime);
        this.currentScrollY = this._getItemNumber('currentScrollY', this.currentScrollY);
        this.darkTheme = this._getItemBoolean('darkTheme', this.darkTheme);
        this.concurrencyCount = this._getItemNumber('concurrencyCount', this.concurrencyCount);
        this.lastPlaylistIterator = this._getItemString('lastPlaylistIterator', this.lastPlaylistIterator);
        this.searchFor = this._getItemString('searchFor', this.searchFor);
        this.searchScope = this._getItemNumber('searchScope', this.searchScope);
        this.useRegEx = this._getItemBoolean('useRegEx', this.useRegEx);
        this.regExFlags = this._getItemString('regExFlags', this.regExFlags);
        this.applyAndBetweenTerms = this._getItemBoolean('applyAndBetweenTerms', this.applyAndBetweenTerms);
        this.ignoreDiacritics = this._getItemBoolean('ignoreDiacritics', this.ignoreDiacritics);
        this.playlists = this._getItemJson('playLists', this.playlists);
    }
    setAudioState(val) {
        let oldVal = this._audioState;
        this._audioState = val;
        if (this.onAudioStateChange)
            this.onAudioStateChange(oldVal, val);
    }
    getAudioState() {
        return this._audioState;
    }
    loadPlaylist(idx) {
        let ret = { header: null, list: null };
        if (idx === -1 || this.playlists.length === 0) {
            ret.header = {
                id: crypto.randomUUID(),
                name: 'New Playlist',
            };
            ret.list = {
                id: ret.header.id,
                list: []
            };
            this.playlists.push(ret.header);
            this.savePlaylist(ret);
        }
        else {
            ret.header = this.playlists[idx];
            const plKey = `pl.${ret.header.id}`;
            ret.list = this._getItemJson(plKey, { id: ret.header.id, list: [] });
        }
        return ret;
    }
    savePlaylist(plTuple) {
        const plKey = `pl.${plTuple.list.id}`;
        this._setItemJson(plKey, plTuple.list);
        this._setItemJson('playLists', this.playlists);
    }
    static toLineRef(lineNum, begIdxPos, begPerc, endIdxPos, endPerc) {
        let ret = `${lineNum}:${begIdxPos}:${begPerc.toFixed(3)}`;
        if (endIdxPos && endPerc)
            ret += `:${endIdxPos}:${endPerc.toFixed(3)}`;
        return ret;
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