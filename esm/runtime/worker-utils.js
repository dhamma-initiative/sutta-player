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
        return new Promise((resolve, reject) => {
            const transaction = WorkerFactory._worker_halt_tok_db.transaction("stop-tokens", "readwrite");
            const objectStore = transaction.objectStore("stop-tokens");
            const stopToken = crypto.randomUUID();
            objectStore.put("0", stopToken);
            transaction.oncomplete = () => resolve(stopToken);
            transaction.onerror = (event) => reject(event.target.error);
        });
    }
    static async signalHalt(stopToken, halt = true) {
        return new Promise((resolve, reject) => {
            const transaction = WorkerFactory._worker_halt_tok_db.transaction("stop-tokens", "readwrite");
            const objectStore = transaction.objectStore("stop-tokens");
            objectStore.put(halt ? "1" : "0", stopToken);
            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => reject(event.target.error);
        });
    }
    static async wasHaltSignalled(stopToken) {
        return new Promise((resolve, reject) => {
            const transaction = WorkerFactory._worker_halt_tok_db.transaction("stop-tokens", "readonly");
            const objectStore = transaction.objectStore("stop-tokens");
            const getRequest = objectStore.get(stopToken);
            getRequest.onsuccess = (event) => {
                const stopTokenValue = event.target.result;
                resolve(stopTokenValue === "1");
            };
            getRequest.onerror = (event) => reject(event.target.error);
        });
    }
    static async clearHalt(stopToken) {
        return new Promise((resolve, reject) => {
            const transaction = WorkerFactory._worker_halt_tok_db.transaction("stop-tokens", "readwrite");
            const objectStore = transaction.objectStore("stop-tokens");
            objectStore.delete(stopToken);
            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => reject(event.target.error);
        });
    }
    static async _initialize() {
        if (WorkerFactory._worker_halt_tok_db === null) {
            return new Promise((resolve) => {
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
                    resolve();
                };
                openRequest.onupgradeneeded = (e) => {
                    WorkerFactory._worker_halt_tok_db = e.target.result;
                    WorkerFactory._worker_halt_tok_db.deleteObjectStore('stop-tokens');
                    const objectStore = WorkerFactory._worker_halt_tok_db.createObjectStore("stop-tokens");
                    WorkerFactory._worker_halt_tok_db_Wait.resolve();
                    resolve();
                };
            });
        }
        return Promise.resolve();
    }
    static {
        (async () => {
            await WorkerFactory._initialize();
        })();
    }
}
//# sourceMappingURL=worker-utils.js.map