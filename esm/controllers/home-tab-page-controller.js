import { AlbumPlayerState } from "../models/album-player-state.js";
import { TabPageController, TabPageView } from "./tab-page-controller.js";
export class HomePageTabController extends TabPageController {
    async loadTrackText() {
        await this.view.loadTrackTextForUi(this.lineSelectionCb);
    }
    lineSelectionCb = (event) => {
        this._onLineSelected(event);
    };
    _onLineSelected(event) {
        const elem = event.target;
        const lineNum = this.view.parseLineNumber(elem.id);
        if (!lineNum)
            return;
        this.model.bookmarkSel.read(this.model.homeSel);
        const lineRefVals = this.view.createLineRefValues(lineNum);
        const textLen = elem.textContent.length;
        const rect = elem.getBoundingClientRect();
        const percDiff = lineRefVals[4] - lineRefVals[2];
        const adjPx = event.clientY - rect.top;
        const adjChars = Math.floor((adjPx / rect.height) * textLen);
        const adjPercDiff = Math.floor((adjPx / rect.height) * percDiff);
        lineRefVals[1] = lineRefVals[1] + adjChars;
        lineRefVals[2] = lineRefVals[2] + adjPercDiff;
        let modLineRef = AlbumPlayerState.toLineRefUsingArr(lineRefVals.splice(0, 3));
        this.model.bookmarkSel.setDetails(modLineRef, null, null);
        this.view.refreshSkipAudioToLine();
        this.container.showUserMessage(`Bookmarked line ${lineNum}`);
    }
    async _createView() {
        this.view = new HomeTabPageView(this);
    }
    async _registerListeners() {
        this.view.skipAudioToLineElem.onclick = async (event) => {
            event.preventDefault();
            await this._onSkipAudioToLine();
        };
        this.view.revealInCatElem.onclick = async (event) => {
            event.preventDefault();
            await this.container.catalogTabPageController.revealTrack(this.model.homeSel);
        };
    }
    async _onSkipAudioToLine() {
        if (!this.model.bookmarkSel.lineRef)
            return;
        const currBookmarkLineRef = this.model.bookmarkSel.lineRef;
        const lineRefVals = AlbumPlayerState.fromLineRef(this.model.bookmarkSel.lineRef);
        await this.container._onLoadAudio(this.model.bookmarkSel);
        this.model.bookmarkSel.lineRef = currBookmarkLineRef;
        this.view.refreshSkipAudioToLine();
        if (lineRefVals[2])
            await this._managePromisedDuration(lineRefVals);
        if (this.model.autoPlay)
            await this.container.view.audioPlayerElem.play();
    }
    async _managePromisedDuration(lineRefVals) {
        const timeOut = new Promise((res, rej) => {
            setTimeout(() => {
                if (this.container.audDurationWaitState === 0)
                    res(-1);
            }, 10000); // 10 sec
        });
        const audDur = await Promise.race([this.container.audDurationWait, timeOut]);
        if (audDur > -1)
            this.container.view.seekToTimePosition(lineRefVals[1], lineRefVals[2], audDur);
    }
    getElementId() {
        return HomeTabPageView.ELEM_ID;
    }
    getCtxMenuElementId() {
        return HomeTabPageView.CTX_MENU_ELEM_ID;
    }
    getIndex() {
        return 0;
    }
}
export class HomeTabPageView extends TabPageView {
    displayingTrackElem = document.getElementById('displayingTrack');
    trackTextBodyElem = document.getElementById('trackTextBody');
    skipAudioToLineElem = document.getElementById('skipAudioToLine');
    revealInCatElem = document.getElementById('revealInCat');
    _charPosLineIndex = [];
    async refresh() {
        this.toggleLineNums(this.controller.model.showLineNums);
        this.refreshSkipAudioToLine();
        await this.loadTrackTextForUi(this.controller.lineSelectionCb);
    }
    refreshSkipAudioToLine() {
        if (this.controller.model.bookmarkSel.lineRef) {
            const vals = AlbumPlayerState.fromLineRef(this.controller.model.bookmarkSel.lineRef);
            const el = document.getElementById('skipAudioToLineLabel');
            el.innerHTML = `Line ${vals[0]}`;
            this.skipAudioToLineElem.style.display = 'initial';
        }
        else
            this.skipAudioToLineElem.style.display = 'none';
    }
    async loadTrackTextForUi(lineSelCb) {
        if (this.controller.model.homeSel.baseRef === null)
            return;
        const textBody = await this._readTrackText(this.controller.model.homeSel);
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
            elem.id = this._createLineElementId(i + 1);
            elem.onclick = lineSelCb;
        }
        this.displayingTrackElem.innerHTML = `${this.controller.model.homeSel.baseRef}`;
        if (this.controller.model.homeSel.lineRef) {
            const lineRefVals = AlbumPlayerState.fromLineRef(this.controller.model.homeSel.lineRef);
            if (lineRefVals[0] && lineRefVals[1])
                this.controller.container.homePageTabController.view.scrollToTextLineNumber(lineRefVals[0], lineRefVals[1]);
        }
    }
    createLineRefValues(lineNum) {
        const totalCharLen = this._charPosLineIndex[this._charPosLineIndex.length - 1];
        const begIdxPos = this._charPosLineIndex[lineNum - 1];
        const begPerc = ((begIdxPos / totalCharLen) * 100);
        const endIdxPos = this._charPosLineIndex[lineNum];
        const endPerc = ((endIdxPos / totalCharLen) * 100);
        const ret = [lineNum, begIdxPos, begPerc, endIdxPos, endPerc];
        return ret;
    }
    toggleLineNums(showLineNums) {
        if (showLineNums)
            this.trackTextBodyElem.classList.add('displayLineNums');
        else
            this.trackTextBodyElem.classList.remove('displayLineNums');
    }
    scrollToTextLineNumber(lineNum, idxPos) {
        const idRef = this._createLineElementId(lineNum);
        let offset = -window.innerHeight / 2;
        const elem = document.getElementById(idRef);
        if (elem) {
            const spanRect = elem.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset;
            const top = spanRect.top + scrollY;
            offset += top;
            if (idxPos > -1) {
                const lnPerc = this._charPosToLineNumPercOffset(idxPos);
                if (lnPerc[0] === lineNum)
                    offset += Math.round(spanRect.height * lnPerc[1]);
            }
            window.scroll({ top: offset, behavior: "smooth" });
        }
    }
    scrollToTextPercCentred(perc) {
        const totalLen = this._charPosLineIndex[this._charPosLineIndex.length - 1];
        const idxPos = (totalLen * perc / 100);
        const lnPerc = this._charPosToLineNumPercOffset(idxPos);
        this.scrollToTextLineNumber(lnPerc[0], idxPos);
    }
    async syncTextPositionWithAudio() {
        if (!this.controller.model.scrollTextWithAudio)
            return;
        if (this.controller.model.homeSel.baseRef !== this.controller.model.homeSel.baseRef)
            return;
        const posPerc = await this.controller.container.getAudioPositionAsPerc();
        this.scrollToTextPercCentred(posPerc);
    }
    parseLineNumber(idRef) {
        const lnAsStr = idRef.replace(HomeTabPageView.LINEID_PREFIX, '');
        const ret = parseInt(lnAsStr);
        return ret;
    }
    async _readTrackText(trackSel) {
        if (trackSel.baseRef === null)
            return null;
        const ret = await this.controller.container.albumStore.queryTrackText(trackSel.baseRef);
        trackSel.isLoaded = true;
        return ret;
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
    _createLineElementId(lineNum) {
        const idRef = `${HomeTabPageView.LINEID_PREFIX}${lineNum}`;
        return idRef;
    }
    static LINEID_PREFIX = '_ln_';
    static ELEM_ID = 'HomeTabPageView';
    static CTX_MENU_ELEM_ID = `${HomeTabPageView.ELEM_ID}CtxMenu`;
}
//# sourceMappingURL=home-tab-page-controller.js.map