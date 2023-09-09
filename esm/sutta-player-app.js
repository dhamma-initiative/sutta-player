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
        const idxPos = appConfig.hosts.indexOf(host);
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
    }
    async stop() {
        await this._controller.tearDown();
    }
    static {
        let enable = localStorage.getItem('ENABLE_CACHE') !== '0';
        if (enable) {
            enable = appConfig.enableCache;
            localStorage.setItem('ENABLE_CACHE', enable ? '1' : '0');
        }
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