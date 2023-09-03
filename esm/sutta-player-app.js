import { SuttaPlayerController } from './controllers/sutta-player-controller.js';
import { AudioStorageQueryableFactory } from './models/audio-storage-queryable.js';
import { SuttaStorageQueryableFactory } from './models/sutta-storage-queryable.js';
import appConfig from './app-config.json' assert { type: 'json' };
import { CacheUtils } from './runtime/cache-utils.js';
export class SuttaPlayerApp {
    static _SINGLETON;
    _suttaStorage;
    _audioStorage;
    _controller;
    static queryAppRoot() {
        const host = location.host;
        let idxPos = appConfig.hosts.indexOf(host);
        let ret = '';
        if (idxPos > -1)
            ret = appConfig.appRoots[idxPos];
        else {
            console.log(`registered hosts: ${appConfig.hosts}`);
            console.log(`registered appRoots: ${appConfig.appRoots}`);
        }
        console.log(`host: ${host}`);
        console.log(`appRoot: ${ret}`);
        return ret;
    }
    async start(appRoot) {
        this._suttaStorage = await SuttaStorageQueryableFactory.create(appConfig.SuttaStorageQueryableImpl);
        this._audioStorage = await AudioStorageQueryableFactory.create(appConfig.AudioRetrievableImpl);
        this._controller = new SuttaPlayerController(appRoot, this._suttaStorage, this._audioStorage);
        await this._controller.setup();
        this.setUpThemeConfig();
    }
    async stop() {
        await this._controller.tearDown();
    }
    setUpThemeConfig() {
        const themeSwitcher = {
            // Config
            _scheme: "auto",
            menuTarget: "details[role='list']",
            buttonsTarget: "a[data-theme-switcher]",
            buttonAttribute: "data-theme-switcher",
            rootAttribute: "data-theme",
            localStorageKey: "picoPreferredColorScheme",
            // Init
            init() {
                this.scheme = this.schemeFromLocalStorage;
                this.initSwitchers();
            },
            // Get color scheme from local storage
            get schemeFromLocalStorage() {
                if (localStorage.getItem(this.localStorageKey) !== null) {
                    return localStorage.getItem(this.localStorageKey);
                }
                return this._scheme;
            },
            // Preferred color scheme
            get preferredColorScheme() {
                return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            },
            // Init switchers
            initSwitchers() {
                const buttons = document.querySelectorAll(this.buttonsTarget);
                buttons.forEach((button) => {
                    button.addEventListener("click", (event) => {
                        event.preventDefault();
                        // Set scheme
                        this.scheme = button.getAttribute(this.buttonAttribute);
                        // Close dropdown
                        document.querySelector(this.menuTarget).removeAttribute("open");
                    }, false);
                });
            },
            // Set scheme
            set scheme(scheme) {
                if (scheme == "auto") {
                    this.preferredColorScheme == "dark" ? (this._scheme = "dark") : (this._scheme = "light");
                }
                else if (scheme == "dark" || scheme == "light") {
                    this._scheme = scheme;
                }
                this.applyScheme();
                this.schemeToLocalStorage();
            },
            // Get scheme
            get scheme() {
                return this._scheme;
            },
            // Apply scheme
            applyScheme() {
                document.querySelector("html").setAttribute(this.rootAttribute, this.scheme);
            },
            // Store scheme to local storage
            schemeToLocalStorage() {
                localStorage.setItem(this.localStorageKey, this.scheme);
            },
        };
        // Init
        themeSwitcher.init();
    }
    static {
        const enable = localStorage.getItem('ENABLE_CACHE') !== '0';
        CacheUtils.ENABLE_CACHE = enable;
        const appRoot = SuttaPlayerApp.queryAppRoot();
        CacheUtils.initialise(appRoot + 'sutta-player-sw.js');
        window.addEventListener('load', async () => {
            SuttaPlayerApp._SINGLETON = new SuttaPlayerApp();
            await SuttaPlayerApp._SINGLETON.start(appRoot);
        });
        window.addEventListener('unload', async () => {
            await SuttaPlayerApp._SINGLETON.stop();
        });
    }
}
//# sourceMappingURL=sutta-player-app.js.map