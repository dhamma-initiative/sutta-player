import { SuttaPlayerController } from './controllers/sutta-player-controller.js';
import { SuttaStorageQueryableFactory } from './models/sutta-storage-queryable.js';
import { AudioStorageQueryableFactory } from './models/audio-storage-queryable.js';
import appConfig from './app-config.json' assert { type: 'json' };
export class SuttaPlayerApp {
    static _SINGLETON;
    _suttaStorage;
    _audioStorage;
    _controller;
    async start() {
        this._suttaStorage = await SuttaStorageQueryableFactory.create(appConfig.SuttaStorageQueryableImpl);
        this._audioStorage = await AudioStorageQueryableFactory.create(appConfig.AudioRetrievableImpl);
        this._controller = new SuttaPlayerController(this._suttaStorage, this._audioStorage);
        await this._controller.setup();
    }
    async stop() {
        await this._controller.tearDown();
    }
    static {
        window.addEventListener('load', async () => {
            SuttaPlayerApp._SINGLETON = new SuttaPlayerApp();
            await SuttaPlayerApp._SINGLETON.start();
        });
        window.addEventListener('unload', async () => {
            await SuttaPlayerApp._SINGLETON.stop();
        });
    }
}
//# sourceMappingURL=sutta-player-app.js.map