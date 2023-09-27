import { DeferredPromise } from "./deferred-promise.js";
export class WorkerFactory {
    static _worker_halt_tok_db_Wait = new DeferredPromise();
    static _worker_halt_tok_db = null;
    static ID_COUNTER = 0;
    static async createRqstMsg(type, load, existingStopToken) {
        return {
            id: WorkerFactory.ID_COUNTER++,
            stopToken: existingStopToken ? existingStopToken : await WorkerFactory.createStopToken(),
            type: type,
            payload: load
        };
    }
    static createRespMsg(rqst, load) {
        rqst.payload = load; // repurposing rqst!
        return rqst;
    }
    static async createStopToken() {
        await WorkerFactory._worker_halt_tok_db_Wait;
        const ret = new DeferredPromise();
        const transaction = WorkerFactory._worker_halt_tok_db.transaction("stop-tokens", "readwrite");
        const objectStore = transaction.objectStore("stop-tokens");
        const stopToken = crypto.randomUUID();
        objectStore.put("0", stopToken);
        transaction.oncomplete = () => ret.resolve(stopToken);
        transaction.onerror = (event) => ret.reject(event.target.error);
        return ret;
    }
    static async signalHalt(stopToken, halt = true) {
        const ret = new DeferredPromise();
        const transaction = WorkerFactory._worker_halt_tok_db.transaction("stop-tokens", "readwrite");
        const objectStore = transaction.objectStore("stop-tokens");
        objectStore.put(halt ? "1" : "0", stopToken);
        transaction.oncomplete = () => ret.resolve();
        transaction.onerror = (event) => ret.reject(event.target.error);
        return ret;
    }
    static async wasHaltSignalled(stopToken) {
        const ret = new DeferredPromise();
        const transaction = WorkerFactory._worker_halt_tok_db.transaction("stop-tokens", "readonly");
        const objectStore = transaction.objectStore("stop-tokens");
        const getRequest = objectStore.get(stopToken);
        getRequest.onsuccess = (event) => {
            const stopTokenValue = event.target.result;
            ret.resolve(stopTokenValue === "1");
        };
        getRequest.onerror = (event) => ret.reject(event.target.error);
        return ret;
    }
    static async clearHalt(stopToken) {
        const ret = new DeferredPromise();
        const transaction = WorkerFactory._worker_halt_tok_db.transaction("stop-tokens", "readwrite");
        const objectStore = transaction.objectStore("stop-tokens");
        objectStore.delete(stopToken);
        transaction.oncomplete = () => ret.resolve();
        transaction.onerror = (event) => ret.reject(event.target.error);
        return ret;
    }
    static async _initialize() {
        const ret = new DeferredPromise();
        if (WorkerFactory._worker_halt_tok_db === null) {
            const openRequest = indexedDB.open("worker-halt-tokens");
            openRequest.onsuccess = (e) => {
                WorkerFactory._worker_halt_tok_db = e.target.result;
                const transaction = WorkerFactory._worker_halt_tok_db.transaction(WorkerFactory._worker_halt_tok_db.objectStoreNames, 'readwrite');
                transaction.onerror = (e) => console.error('Transaction error:', e.target.error);
                // Loop through all object stores and clear them.
                for (const storeName of transaction.objectStoreNames) {
                    const objectStore = transaction.objectStore(storeName);
                    objectStore.clear();
                }
                transaction.oncomplete = () => {
                    console.log('All IndexedDB data cleared.');
                };
                WorkerFactory._worker_halt_tok_db_Wait.resolve();
                ret.resolve();
            };
            openRequest.onupgradeneeded = (e) => {
                WorkerFactory._worker_halt_tok_db = e.target.result;
                try {
                    WorkerFactory._worker_halt_tok_db.deleteObjectStore('stop-tokens');
                }
                catch (err) { }
                const objectStore = WorkerFactory._worker_halt_tok_db.createObjectStore("stop-tokens");
                WorkerFactory._worker_halt_tok_db_Wait.resolve();
                ret.resolve();
            };
        }
        else
            ret.resolve();
        return ret;
    }
    static {
        (async () => {
            await WorkerFactory._initialize();
        })();
    }
}
//# sourceMappingURL=worker-utils.js.map