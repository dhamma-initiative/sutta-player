import { SuttaPlayerController } from './controllers/sutta-player-controller.js'
import { SuttaStorageQueryable, SuttaStorageQueryableFactory } from './models/sutta-storage-queryable.js'
import { AudioStorageQueryable, AudioStorageQueryableFactory } from './models/audio-storage-queryable.js'

import appConfig from './app-config.json' assert { type: 'json' }
import { CacheUtils } from './runtime/cache-utils.js'

export class SuttaPlayerApp {
    private static _SINGLETON: SuttaPlayerApp

    private _suttaStorage: SuttaStorageQueryable
    private _audioStorage: AudioStorageQueryable

    private _controller: SuttaPlayerController

    public queryAppRoot() {
        const host = location.host
        let idxPos = appConfig.hosts.indexOf(host)
        let ret = ''
        if (idxPos > -1)
            ret = appConfig.appRoots[idxPos]
        else {
            console.log(`registered hosts: ${appConfig.hosts}`)
            console.log(`registered appRoots: ${appConfig.appRoots}`)
        }
        console.log(`host: ${host}`)
        console.log(`appRoot: ${ret}`)
        return ret
    }

    public async start() {
        this._suttaStorage = await SuttaStorageQueryableFactory.create(appConfig.SuttaStorageQueryableImpl)
        this._audioStorage = await AudioStorageQueryableFactory.create(appConfig.AudioRetrievableImpl)
        this._controller = new SuttaPlayerController(this._suttaStorage, this._audioStorage)
        await this._controller.setup()
        this.setUpThemeConfig()
    }

    public async stop() {
        await this._controller.tearDown()
    }

    public setUpThemeConfig() {
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
            if (typeof window.localStorage !== "undefined") {
                if (window.localStorage.getItem(this.localStorageKey) !== null) {
                return window.localStorage.getItem(this.localStorageKey);
                }
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
                button.addEventListener(
                "click",
                (event) => {
                    event.preventDefault();
                    // Set scheme
                    this.scheme = button.getAttribute(this.buttonAttribute);
                    // Close dropdown
                    document.querySelector(this.menuTarget).removeAttribute("open");
                },
                false
                );
            });
            },
        
            // Set scheme
            set scheme(scheme) {
            if (scheme == "auto") {
                this.preferredColorScheme == "dark" ? (this._scheme = "dark") : (this._scheme = "light");
            } else if (scheme == "dark" || scheme == "light") {
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
            if (typeof window.localStorage !== "undefined") {
                window.localStorage.setItem(this.localStorageKey, this.scheme);
            }
            },
        };
        
        // Init
        themeSwitcher.init();
    }

    static {
		window.addEventListener('load', async () => {
			SuttaPlayerApp._SINGLETON = new SuttaPlayerApp()
            const appRoot = SuttaPlayerApp._SINGLETON.queryAppRoot()
            CacheUtils.initialise(appRoot + '/service-worker.js')
			await SuttaPlayerApp._SINGLETON.start()
		})

        window.addEventListener('unload', async () => {
			await SuttaPlayerApp._SINGLETON.stop()
		})
	}
}