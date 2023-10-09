import { BaseController, BaseView } from "./base-controller.js";

export class MainMenuController<V extends MainMenuView<any>> extends BaseController<V> {
    protected async _createView() {
        this.view = new MainMenuView(this) as V
    }

    protected async _registerListeners() {
        this._registerViewMenuListeners()
        this._registerSettingsMenuListeners()
    }

    private _registerSettingsMenuListeners() {
        this.view.autoPlayElem.onchange = async () => {
            this.model.autoPlay = this.view.autoPlayElem.checked
        }
        this.view.playNextElem.onchange = async () => {
            this.model.playNext = this.view.playNextElem.checked
            if (this.model.playNext)
                this.model.repeat = false
        }
        this.view.repeatElem.onchange = async () => {
            this.model.repeat = this.view.repeatElem.checked
            if (this.model.repeat)
                this.model.playNext = false
        }
        this.view.scrollTextWithAudioElem.onchange = async () => {
            this.model.scrollTextWithAudio = this.view.scrollTextWithAudioElem.checked
        }
        this.view.showLineNumsElem.onchange = async () => {
            this.model.showLineNums = this.view.showLineNumsElem.checked
            this.container.homePageTabController.view.toggleLineNums(this.model.showLineNums)
        }
        this.view.darkThemeElem.onchange = async () => {
            this.model.darkTheme = this.view.darkThemeElem.checked
            this.view.setColorTheme()
        }
    }

    private _registerViewMenuListeners() {
        let viewMenuOnChangeListener = (e: Event) => {
            const el = <HTMLInputElement>e.target;
            const tabIdx = parseInt(el.value);
            this.container.openTab(tabIdx);
        };
        for (let i = 0; i < this.view.viewMenuOptions.length; i++)
            this.view.viewMenuOptions[i].onchange = viewMenuOnChangeListener;

        this.view.aboutMenuElem.onclick = (ev: Event) => {
            ev.preventDefault();
            this.container.openTab(5);
        };
    }
}

export class MainMenuView<C extends MainMenuController<MainMenuView<C>>> extends BaseView<C> {
    // view menu
    homeMenuElem = <HTMLInputElement>document.getElementById('homeMenu')
    catalogMenuElem = <HTMLInputElement>document.getElementById('catalogMenu')
    searchMenuElem = <HTMLInputElement>document.getElementById('searchMenu')
    playlistMenuElem = <HTMLInputElement>document.getElementById('playlistMenu')
    offlineMenuElem = <HTMLInputElement>document.getElementById('offlineMenu')
    aboutMenuElem = <HTMLAnchorElement>document.getElementById('aboutMenu')

    viewMenuOptions: HTMLInputElement[] = []

    // settings menu
    autoPlayElem = <HTMLInputElement>document.getElementById('autoPlay')
    playNextElem = <HTMLInputElement>document.getElementById('playNext')
    repeatElem = <HTMLInputElement>document.getElementById('repeat')
    loadAudioWithTextElem = <HTMLInputElement>document.getElementById('loadAudioWithText')
    scrollTextWithAudioElem = <HTMLInputElement>document.getElementById('scrollTextWithAudio')
    showLineNumsElem = <HTMLInputElement>document.getElementById('showLineNums')
    darkThemeElem = <HTMLInputElement>document.getElementById('darkTheme')
    resetAppMenuElem = <HTMLAnchorElement>document.getElementById('resetAppMenu')

    public async bind() {
        this.viewMenuOptions.push(this.homeMenuElem)
        this.viewMenuOptions.push(this.catalogMenuElem)
        this.viewMenuOptions.push(this.searchMenuElem)
        this.viewMenuOptions.push(this.playlistMenuElem)
        this.viewMenuOptions.push(this.offlineMenuElem)
    }

    public async refresh() {
        this.autoPlayElem.checked = this.controller.model.autoPlay
        this.playNextElem.checked = this.controller.model.playNext
        this.repeatElem.checked = this.controller.model.repeat

        this.loadAudioWithTextElem.checked = this.controller.model.loadAudioWithText
        this.scrollTextWithAudioElem.checked = this.controller.model.scrollTextWithAudio

        this.showLineNumsElem.checked = this.controller.model.showLineNums
        this.darkThemeElem.checked = this.controller.model.darkTheme

        this.setColorTheme()
    }

    public setColorTheme() {
        const theme: string = this.getColorTheme()
        this.setElementsTheme(document.documentElement, theme);
    }

    public getColorTheme(inv = false) {
        const query = inv ? !this.controller.model.darkTheme : this.controller.model.darkTheme
        const theme: string = query ? 'dark' : 'light'
        return theme
    }

    public setElementsTheme(el: HTMLElement, theme: string) {
        el.setAttribute('data-theme', theme);
    }

    static ELEM_ID = 'MainMenuView' 
}