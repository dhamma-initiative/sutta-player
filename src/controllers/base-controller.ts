import { AlbumPlayerState } from "../models/album-player-state.js"
import { SuttaPlayerContainer, SuttaPlayerFabView } from "./sutta-player-container.js"

export class BaseController<V extends BaseView<BaseController<V>>> {
    public model: AlbumPlayerState
    public view: V | null = null
    public container: SuttaPlayerContainer<SuttaPlayerFabView<any>>

    constructor(mdl: AlbumPlayerState, cntr: SuttaPlayerContainer<any>) {
        this.model = mdl
        this.container = cntr
        if (this.container)
            this.container.registerController(this)
    }

    public async setup() {
        await this._createView()
        if (this.view) {
            await this.view.bind()
            await this.refresh()
        }
        this._registerListeners()
    }

    public async tearDown() {
        this.view = null
        this.model = null
        this.container = null
    }

    public async refresh() {
        await this.view.refresh()
    }

    protected async _createView() {}
    protected async _registerListeners() {}
}

export class BaseView<C extends BaseController<BaseView<C>>> {
    public controller: C | null = null

    constructor(ctrl: C) {
        this.controller = ctrl
    }

    public async bind() {}
    public async refresh() {}
}