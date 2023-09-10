export class AboutController {
    _model;
    _view;
    _mainCtrl;
    constructor(mdl, vw, ctrl) {
        this._model = mdl;
        this._view = vw;
        this._mainCtrl = ctrl;
    }
    async setup() {
        this._registerListeners();
    }
    async tearDown() {
        this._view = null;
        this._model = null;
        return true;
    }
    _registerListeners() {
        this._view.aboutMenuElem.onclick = async (event) => {
            await this._view.toggleAboutInfo(event);
        };
        this._view.aboutDialogCloseElem.onclick = this._view.aboutMenuElem.onclick;
    }
}
//# sourceMappingURL=about-controller.js.map