import { TrackSelection } from "../models/album-player-state.js";
import { TabPageController, TabPageView } from "./tab-page-controller.js";
export class CatalogTabPageController extends TabPageController {
    _catalogPlaylistIterator;
    async setup() {
        await super.setup();
        if (!this._catalogPlaylistIterator)
            this._catalogPlaylistIterator = new CatalogPlaylistIterator(this);
        this.container.registerIterator(CatalogPlaylistIterator.SEL_CONTEXT, this._catalogPlaylistIterator);
        this.container.registerIterator(null, this._catalogPlaylistIterator); // default
    }
    async revealTrack(srcSel) {
        this.model.catSel.read(srcSel);
        if (this.view.albumElem.selectedIndex !== this.model.catSel.albumIndex) {
            this.view.albumElem.selectedIndex = this.model.catSel.albumIndex;
            await this.view.refreshTrackSelectionList();
        }
        this.view.trackElem.selectedIndex = this.model.catSel.trackIndex;
        this.container.showUserMessage('Revealing track into catalog');
        this.container.openTab(this.getIndex());
    }
    async _createView() {
        this.view = new CatalogTabPageView(this);
    }
    async _registerListeners() {
        this.view.albumElem.onchange = async () => {
            if (this.view.albumElem.selectedIndex !== this.model.catSel.albumIndex)
                await this._onAlbumSelected(null);
        };
        this.view.trackElem.onchange = async () => {
            await this._onTrackSelected(null);
        };
        this.view.loadCatalogTrackElem.onclick = async () => {
            await this._onLoadTrack(this.model.catSel);
        };
        this.view.selectRandomElem.onclick = async () => {
            await this._onSelectRandom();
        };
    }
    async _onAlbumSelected(forceAlbIdx) {
        this.model.catSel.albumIndex = (forceAlbIdx === null) ? Number(this.view.albumElem.value) : forceAlbIdx;
        this.model.catSel.trackIndex = 0;
        this.view.trackElem.selectedIndex = this.model.catSel.trackIndex;
        await this.model.catSel.updateBaseRef(this.container.albumStore);
        await this.view.refreshTrackSelectionList();
    }
    async _onTrackSelected(forceTrackIdx) {
        this.model.catSel.trackIndex = (forceTrackIdx === null) ? Number(this.view.trackElem.value) : forceTrackIdx;
        await this.model.catSel.updateBaseRef(this.container.albumStore);
    }
    async _onLoadTrack(srcSel) {
        this.container.openTab(0);
        if (this.model.homeSel.isSimilar(srcSel) && this.model.homeSel.isLoaded)
            return true;
        this.model.bookmarkSel.read(srcSel);
        this.container.homePageTabController.view.refreshSkipAudioToLine();
        this.model.homeSel.read(srcSel);
        await this.container.homePageTabController.loadTrackText();
        if (this.model.loadAudioWithText)
            await this._onLoadAudio(srcSel);
        return false;
    }
    async _onLoadAudio(srcSel) {
        this.model.currentTime = 0;
        this.model.homeSel.read(srcSel);
        this.model.bookmarkSel.read(srcSel);
        const isNewAwaitDurRqd = [false];
        await this.container.view.loadTrackAudio(isNewAwaitDurRqd);
        if (isNewAwaitDurRqd[0])
            this.container.createAudioDurationWait();
    }
    async _onSelectRandom() {
        this.model.catSel.albumIndex = Math.round(Math.random() * this.view.albumElem.length);
        const fileList = await this.container.albumStore.queryTrackReferences(this.model.catSel.albumIndex);
        this.model.catSel.trackIndex = Math.round(Math.random() * fileList.length);
        await this.model.catSel.updateBaseRef(this.container.albumStore);
        if (this.view.albumElem.selectedIndex !== this.model.catSel.albumIndex) {
            this.view.albumElem.selectedIndex = this.model.catSel.albumIndex;
            await this.view.refreshTrackSelectionList();
        }
        this.view.trackElem.selectedIndex = this.model.catSel.trackIndex;
    }
    getElementId() {
        return CatalogTabPageView.ELEM_ID;
    }
    getCtxMenuElementId() {
        return CatalogTabPageView.CTX_MENU_ELEM_ID;
    }
    getIndex() {
        return 1;
    }
}
export class CatalogTabPageView extends TabPageView {
    albumElem = document.getElementById('album');
    trackElem = document.getElementById('track');
    loadCatalogTrackElem = document.getElementById('loadCatalogTrack');
    selectRandomElem = document.getElementById('selectRandom');
    async bind() {
        this._loadAlbumsList();
    }
    async refresh() {
        this.refreshTrackSelectionList();
    }
    _loadAlbumsList() {
        this.albumElem.innerHTML = '';
        const colLov = this.controller.container.albumStore.queryAlbumNames();
        for (let i = 0; i < colLov.length; i++) {
            const option = document.createElement('option');
            option.value = `${i}`;
            option.innerHTML = `${colLov[i]}`;
            this.albumElem.append(option);
        }
        this.albumElem.selectedIndex = this.controller.model.catSel.albumIndex;
    }
    async refreshTrackSelectionList() {
        this.trackElem.innerHTML = '';
        const albIdx = this.controller.model.catSel.albumIndex;
        const trkIdx = this.controller.model.catSel.trackIndex;
        const trackLov = await this.controller.container.albumStore.queryTrackReferences(albIdx);
        let count = 0;
        await this.controller.container.albumStore.queryAlbumCacheStatus(albIdx, (baseRef, idx, taStatus, cargo) => {
            if (albIdx !== cargo.albumIndex)
                return;
            count++;
            const option = document.createElement('option');
            option.value = `${idx}`;
            option.innerHTML = this._annotateTrackSelection(taStatus, trackLov[idx]);
            this.trackElem.add(option, idx);
            if (count === trackLov.length)
                this.trackElem.selectedIndex = trkIdx;
        });
    }
    async refreshTrackSelectionLabel(trackSel) {
        if (!trackSel)
            trackSel = this.controller.model.catSel;
        const option = this.trackElem.children[trackSel.trackIndex];
        if (!option)
            return;
        const taStatus = await this.controller.container.albumStore.isInCache(trackSel.baseRef, true, true);
        option.innerHTML = this._annotateTrackSelection(taStatus, trackSel.dictionary['trackName']);
    }
    _annotateTrackSelection(taStatus, trackName) {
        let ret = (taStatus[0] && taStatus[1]) ? '✔️' : (taStatus[1]) ? '🔊' : (taStatus[0]) ? '👀' : '◻';
        ret = `${ret} ${trackName}`;
        return ret;
    }
    static ELEM_ID = 'CatalogTabPageView';
    static CTX_MENU_ELEM_ID = `${CatalogTabPageView.ELEM_ID}CtxMenu`;
}
export class CatalogPlaylistIterator {
    static SEL_CONTEXT = 'catalogItrSel';
    _controller;
    _catalogItrSel = new TrackSelection(CatalogPlaylistIterator.SEL_CONTEXT);
    _size = 0;
    constructor(ctrl) {
        this._controller = ctrl;
    }
    async setContext(ctx) {
        this._catalogItrSel.read(ctx);
        const fileList = await this._controller.container.albumStore.queryTrackReferences(this._catalogItrSel.albumIndex);
        this._size = fileList.length;
        this._controller.model.lastPlaylistIterator = CatalogPlaylistIterator.SEL_CONTEXT;
    }
    size() {
        return this._size;
    }
    hasPrev() {
        let ret = this._catalogItrSel.trackIndex > 0;
        return ret;
    }
    hasNext() {
        let ret = this._catalogItrSel.trackIndex < this._size - 1;
        return ret;
    }
    async prev() {
        if (!this.hasPrev()) {
            this._controller.container.showUserMessage('Beginning of playlist');
            return null;
        }
        this._catalogItrSel.trackIndex--;
        this._catalogItrSel.isLoaded = false;
        await this._catalogItrSel.updateBaseRef(this._controller.container.albumStore);
        return this._catalogItrSel;
    }
    async next() {
        if (!this.hasNext()) {
            this._controller.container.showUserMessage('End of playlist');
            return null;
        }
        this._catalogItrSel.trackIndex++;
        this._catalogItrSel.isLoaded = false;
        await this._catalogItrSel.updateBaseRef(this._controller.container.albumStore);
        return this._catalogItrSel;
    }
    current() {
        return this._catalogItrSel;
    }
}
//# sourceMappingURL=catalog-tab-page-controller.js.map