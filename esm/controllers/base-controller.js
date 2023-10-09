export class BaseController {
    model;
    view = null;
    container;
    constructor(mdl, cntr) {
        this.model = mdl;
        this.container = cntr;
        if (this.container)
            this.container.registerController(this);
    }
    async setup() {
        await this._createView();
        if (this.view) {
            await this.view.bind();
            await this.refresh();
        }
        this._registerListeners();
    }
    async tearDown() {
        this.view = null;
        this.model = null;
        this.container = null;
    }
    async refresh() {
        await this.view.refresh();
    }
    async _createView() { }
    async _registerListeners() { }
}
export class BaseView {
    controller = null;
    constructor(ctrl) {
        this.controller = ctrl;
    }
    async bind() { }
    async refresh() { }
}
//# sourceMappingURL=base-controller.js.map