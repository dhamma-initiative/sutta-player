import { TabPageController, TabPageView } from "./tab-page-controller.js";
export declare class HomePageTabController<V extends HomeTabPageView<any>> extends TabPageController<V> {
    loadTrackText(): Promise<void>;
    lineSelectionCb: (event: MouseEvent) => void;
    private _onLineSelected;
    protected _createView(): Promise<void>;
    protected _registerListeners(): Promise<void>;
    private _onSkipAudioToLine;
    private _managePromisedDuration;
    getElementId(): string;
    getCtxMenuElementId(): string;
    getIndex(): number;
}
export declare class HomeTabPageView<C extends HomePageTabController<HomeTabPageView<C>>> extends TabPageView<C> {
    displayingTrackElem: HTMLElement;
    trackTextBodyElem: HTMLDivElement;
    skipAudioToLineElem: HTMLAnchorElement;
    revealInCatElem: HTMLAnchorElement;
    private _charPosLineIndex;
    refresh(): Promise<void>;
    refreshSkipAudioToLine(): void;
    loadTrackTextForUi(lineSelCb: (event: MouseEvent) => void): Promise<void>;
    createLineRefValues(lineNum: number): number[];
    toggleLineNums(showLineNums: boolean): void;
    scrollToTextLineNumber(lineNum: number, idxPos: number): void;
    scrollToTextPercCentred(perc: number): void;
    syncTextPositionWithAudio(): Promise<void>;
    parseLineNumber(idRef: string): number;
    private _readTrackText;
    private _charPosToLineNumPercOffset;
    private _createLineElementId;
    static LINEID_PREFIX: string;
    static ELEM_ID: string;
    static CTX_MENU_ELEM_ID: string;
}
