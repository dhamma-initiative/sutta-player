export class DeferredPromise {
    _promise;
    _resolve;
    _reject;
    constructor() {
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }
    reject(reason) {
        this._reject(reason);
    }
    resolve(param) {
        this._resolve(param);
    }
    then(onfulfilled, onrejected) {
        return this._promise.then(onfulfilled, onrejected);
    }
    catch(onrejected) {
        return this._promise.catch(onrejected);
    }
    finally(onfinally) {
        return this._promise.finally(onfinally);
    }
    [Symbol.toStringTag];
}
//# sourceMappingURL=deferred-promise.js.map