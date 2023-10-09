import { BaseController, BaseView } from "./base-controller.js";
export class TabPageController extends BaseController {
    constructor(mdl, cntr) {
        super(mdl, cntr);
    }
    getElementId() {
        throw new Error('IllegalStateException: Subclasses must implement getElementId()');
    }
    getCtxMenuElementId() {
        return null; // optional
    }
    getIndex() {
        throw new Error('IllegalStateException: Subclasses must implement getIndex()');
    }
    onEnter() {
        this._toggleViewElements('block');
    }
    onExit() {
        this._toggleViewElements('none');
    }
    _toggleViewElements(styleDisp) {
        const tabPageElem = document.getElementById(this.getElementId());
        tabPageElem.style.display = styleDisp;
        const tabPageCtxMenuElem = document.getElementById(this.getCtxMenuElementId());
        if (tabPageCtxMenuElem)
            tabPageCtxMenuElem.style.display = styleDisp;
    }
}
export class TabPageView extends BaseView {
}
//# sourceMappingURL=tab-page-controller.js.map