import { SuttaPlayerController } from './controllers/sutta-player-controller.js'
import { SuttaStorageQueryable, SuttaStorageQueryableFactory } from './models/sutta-storage-queryable.js'
import { AudioStorageQueryable, AudioStorageQueryableFactory } from './models/audio-storage-queryable.js'

import appConfig from './app-config.json' assert { type: 'json' }

export class SuttaPlayerApp {
    private static _SINGLETON: SuttaPlayerApp

    private _suttaStorage: SuttaStorageQueryable
    private _audioStorage: AudioStorageQueryable

    private _controller: SuttaPlayerController

    public async start() {
        this._suttaStorage = await SuttaStorageQueryableFactory.create(appConfig.SuttaStorageQueryableImpl)
        this._audioStorage = await AudioStorageQueryableFactory.create(appConfig.AudioRetrievableImpl)
        this._controller = new SuttaPlayerController(this._suttaStorage, this._audioStorage)
        await this._controller.setup()
    }

    public async stop() {
        await this._controller.tearDown()
    }

    static {
		window.addEventListener('load', async () => {
			SuttaPlayerApp._SINGLETON = new SuttaPlayerApp()
			await SuttaPlayerApp._SINGLETON.start()
		})

        window.addEventListener('unload', async () => {
			await SuttaPlayerApp._SINGLETON.stop()
		})
	}
}