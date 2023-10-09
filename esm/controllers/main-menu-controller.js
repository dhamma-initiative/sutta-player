import { BaseController, BaseView } from "./base-controller.js";
export class MainMenuController extends BaseController {
    async _createView() {
        this.view = new MainMenuView(this);
    }
    async _registerListeners() {
        this._registerViewMenuListeners();
        this._registerSettingsMenuListeners();
    }
    _registerSettingsMenuListeners() {
        this.view.autoPlayElem.onchange = async () => {
            this.model.autoPlay = this.view.autoPlayElem.checked;
        };
        this.view.playNextElem.onchange = async () => {
            this.model.playNext = this.view.playNextElem.checked;
            if (this.model.playNext)
                this.model.repeat = false;
        };
        this.view.repeatElem.onchange = async () => {
            this.model.repeat = this.view.repeatElem.checked;
            if (this.model.repeat)
                this.model.playNext = false;
        };
        this.view.scrollTextWithAudioElem.onchange = async () => {
            this.model.scrollTextWithAudio = this.view.scrollTextWithAudioElem.checked;
        };
        this.view.showLineNumsElem.onchange = async () => {
            this.model.showLineNums = this.view.showLineNumsElem.checked;
            this.container.homePageTabController.view.toggleLineNums(this.model.showLineNums);
        };
        this.view.darkThemeElem.onchange = async () => {
            this.model.darkTheme = this.view.darkThemeElem.checked;
            this.view.setColorTheme();
        };
    }
    _registerViewMenuListeners() {
        let viewMenuOnChangeListener = (e) => {
            const el = e.target;
            const tabIdx = parseInt(el.value);
            this.container.openTab(tabIdx);
        };
        for (let i = 0; i < this.view.viewMenuOptions.length; i++)
            this.view.viewMenuOptions[i].onchange = viewMenuOnChangeListener;
        this.view.aboutMenuElem.onclick = (ev) => {
            ev.preventDefault();
            this.container.openTab(5);
        };
    }
}
export class MainMenuView extends BaseView {
    // view menu
    homeMenuElem = document.getElementById('homeMenu');
    catalogMenuElem = document.getElementById('catalogMenu');
    searchMenuElem = document.getElementById('searchMenu');
    playlistMenuElem = document.getElementById('playlistMenu');
    offlineMenuElem = document.getElementById('offlineMenu');
    aboutMenuElem = document.getElementById('aboutMenu');
    viewMenuOptions = [];
    // settings menu
    autoPlayElem = document.getElementById('autoPlay');
    playNextElem = document.getElementById('playNext');
    repeatElem = document.getElementById('repeat');
    loadAudioWithTextElem = document.getElementById('loadAudioWithText');
    scrollTextWithAudioElem = document.getElementById('scrollTextWithAudio');
    showLineNumsElem = document.getElementById('showLineNums');
    darkThemeElem = document.getElementById('darkTheme');
    resetAppMenuElem = document.getElementById('resetAppMenu');
    async bind() {
        this.viewMenuOptions.push(this.homeMenuElem);
        this.viewMenuOptions.push(this.catalogMenuElem);
        this.viewMenuOptions.push(this.searchMenuElem);
        this.viewMenuOptions.push(this.playlistMenuElem);
        this.viewMenuOptions.push(this.offlineMenuElem);
    }
    async refresh() {
        this.autoPlayElem.checked = this.controller.model.autoPlay;
        this.playNextElem.checked = this.controller.model.playNext;
        this.repeatElem.checked = this.controller.model.repeat;
        this.loadAudioWithTextElem.checked = this.controller.model.loadAudioWithText;
        this.scrollTextWithAudioElem.checked = this.controller.model.scrollTextWithAudio;
        this.showLineNumsElem.checked = this.controller.model.showLineNums;
        this.darkThemeElem.checked = this.controller.model.darkTheme;
        this.setColorTheme();
    }
    setColorTheme() {
        const theme = this.getColorTheme();
        this.setElementsTheme(document.documentElement, theme);
    }
    getColorTheme(inv = false) {
        const query = inv ? !this.controller.model.darkTheme : this.controller.model.darkTheme;
        const theme = query ? 'dark' : 'light';
        return theme;
    }
    setElementsTheme(el, theme) {
        el.setAttribute('data-theme', theme);
    }
    static ELEM_ID = 'MainMenuView';
}
//# sourceMappingURL=main-menu-controller.js.map