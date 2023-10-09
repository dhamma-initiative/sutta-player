import { AlbumPlayerState } from "../models/album-player-state.js"
import { BaseController, BaseView } from "./base-controller.js"
import { SuttaPlayerContainer } from "./sutta-player-container.js"

export class TabPageController<V extends TabPageView<TabPageController<V>>> extends BaseController<V> {
    public constructor(mdl: AlbumPlayerState, cntr: SuttaPlayerContainer<any>) {
        super(mdl, cntr)
    }

    public getElementId(): string {
        throw new Error('IllegalStateException: Subclasses must implement getElementId()')
    }

    public getCtxMenuElementId(): string {
        return null // optional
    }

    public getIndex(): number {
        throw new Error('IllegalStateException: Subclasses must implement getIndex()')
    }

    public onEnter() {
        this._toggleViewElements('block')
    }

    public onExit() {
        this._toggleViewElements('none')
    }

    protected _toggleViewElements(styleDisp: string) {
        const tabPageElem = document.getElementById(this.getElementId())
        tabPageElem.style.display = styleDisp
        const tabPageCtxMenuElem = document.getElementById(this.getCtxMenuElementId())
        if (tabPageCtxMenuElem)
            tabPageCtxMenuElem.style.display = styleDisp
    }
}

export class TabPageView<C extends TabPageController<TabPageView<C>>> extends BaseView<C> {}
