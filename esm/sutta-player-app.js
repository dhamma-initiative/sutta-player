import { SuttaPlayerContainer } from './controllers/sutta-player-container.js';
import { AlbumStorageQueryableFactory } from './models/album-storage-queryable.js';
import appConfig from './app-config.json' assert { type: 'json' };
import { CacheUtils } from './runtime/cache-utils.js';
export class SuttaPlayerApp {
    static _SINGLETON;
    _albumStorage;
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
        const cacheAvailable = await CacheUtils.initialise(appRoot + 'sutta-player-sw.js');
        this._albumStorage = await AlbumStorageQueryableFactory.create(appConfig.AlbumStorageQueryableImpl);
        this._controller = new SuttaPlayerContainer(appRoot, this._albumStorage);
        if (!cacheAvailable)
            this._controller.showUserMessage('Service-worker/Cache not loaded');
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