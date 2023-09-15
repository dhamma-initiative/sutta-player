export class SettingsController {
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
        this._registerAudioListeners();
        this._registerTextListeners();
        this._registerAppearanceListeners;
    }
    _registerAudioListeners() {
        this._view.autoPlayElem.onchange = async () => {
            this._model.autoPlay = this._view.autoPlayElem.checked;
            this._view.refreshViewSettings();
        };
        this._view.playNextElem.onchange = async () => {
            this._model.playNext = this._view.playNextElem.checked;
            if (this._model.playNext)
                this._model.repeat = false;
            this._view.refreshViewSettings();
        };
        this._view.repeatElem.onchange = async () => {
            this._model.repeat = this._view.repeatElem.checked;
            if (this._model.repeat)
                this._model.playNext = false;
            this._view.refreshViewSettings();
        };
    }
    _registerTextListeners() {
        this._view.linkTextToAudioElem.onchange = async () => {
            this._model.linkTextToAudio = this._view.linkTextToAudioElem.checked;
            if (this._model.linkTextToAudio)
                await this._mainCtrl._onLoadText(this._model.audioSel);
        };
        this._view.showLineNumsElem.onchange = async () => {
            this._model.showLineNums = this._view.showLineNumsElem.checked;
            this._view.toggleLineNums();
        };
    }
    _registerAppearanceListeners() {
        this._view.darkThemeElem.onchange = async () => {
            this._model.darkTheme = this._view.darkThemeElem.checked;
            this._view.setColorTheme();
        };
        this._view.showContextControlsElem.onchange = async () => {
            this._model.showContextControls = this._view.showContextControlsElem.checked;
            this._view.showHideContextControls(this._model.showContextControls);
        };
    }
}
//# sourceMappingURL=settings-controller.js.map