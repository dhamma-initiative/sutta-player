import { BaseController, BaseView } from "./base-controller.js";
export declare class MainMenuController<V extends MainMenuView<any>> extends BaseController<V> {
    protected _createView(): Promise<void>;
    protected _registerListeners(): Promise<void>;
    private _registerSettingsMenuListeners;
    private _registerViewMenuListeners;
}
export declare class MainMenuView<C extends MainMenuController<MainMenuView<C>>> extends BaseView<C> {
    homeMenuElem: HTMLInputElement;
    catalogMenuElem: HTMLInputElement;
    searchMenuElem: HTMLInputElement;
    playlistMenuElem: HTMLInputElement;
    offlineMenuElem: HTMLInputElement;
    aboutMenuElem: HTMLAnchorElement;
    viewMenuOptions: HTMLInputElement[];
    autoPlayElem: HTMLInputElement;
    playNextElem: HTMLInputElement;
    repeatElem: HTMLInputElement;
    loadAudioWithTextElem: HTMLInputElement;
    scrollTextWithAudioElem: HTMLInputElement;
    showLineNumsElem: HTMLInputElement;
    darkThemeElem: HTMLInputElement;
    resetAppMenuElem: HTMLAnchorElement;
    bind(): Promise<void>;
    refresh(): Promise<void>;
    setColorTheme(): void;
    getColorTheme(inv?: boolean): string;
    setElementsTheme(el: HTMLElement, theme: string): void;
    static ELEM_ID: string;
}
