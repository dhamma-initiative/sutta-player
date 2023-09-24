import { DeferredPromise } from "./deferred-promise.js"

export type WorkerMessage = {
    id: number
    stopToken: string
    type: string
    payload?: any
}

export class WorkerFactory {
    private static _worker_halt_tok_db_Wait = new DeferredPromise<void>()
    private static _worker_halt_tok_db: any = null

    public static ID_COUNTER: number = 0

    public static async createRqstMsg(type: string, load: any, existingStopToken?: string): Promise<WorkerMessage> {
        return {
            id: WorkerFactory.ID_COUNTER++,
            stopToken: existingStopToken ? existingStopToken : await WorkerFactory.createStopToken(),
            type: type,
            payload: load
        }
    }

    public static createRespMsg(rqst: WorkerMessage, load: any): WorkerMessage {
        rqst.payload = load // repurposing rqst!
        return rqst
    }

    public static async createStopToken(): Promise<string> {
        await WorkerFactory._worker_halt_tok_db_Wait
        return new Promise<string>((resolve, reject) => {
            const transaction = WorkerFactory._worker_halt_tok_db.transaction("stop-tokens", "readwrite")
            const objectStore = transaction.objectStore("stop-tokens")
            const stopToken = crypto.randomUUID()

            objectStore.put("0", stopToken)

            transaction.oncomplete = () => resolve(stopToken)
            transaction.onerror = (event: any) => reject(event.target.error)
        })
    }

    public static async signalHalt(stopToken: string, halt = true): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const transaction = WorkerFactory._worker_halt_tok_db.transaction("stop-tokens", "readwrite")
            const objectStore = transaction.objectStore("stop-tokens")

            objectStore.put(halt ? "1" : "0", stopToken)

            transaction.oncomplete = () => resolve()
            transaction.onerror = (event: any) => reject(event.target.error)
        })
    }

    public static async wasHaltSignalled(stopToken: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const transaction = WorkerFactory._worker_halt_tok_db.transaction("stop-tokens", "readonly")
            const objectStore = transaction.objectStore("stop-tokens")
            const getRequest = objectStore.get(stopToken)

            getRequest.onsuccess = (event: any) => {
                const stopTokenValue = event.target.result
                resolve(stopTokenValue === "1")
            }
            getRequest.onerror = (event: any) => reject(event.target.error)
        })
    }

    public static async clearHalt(stopToken: string) {
        return new Promise<void>((resolve, reject) => {
            const transaction = WorkerFactory._worker_halt_tok_db.transaction("stop-tokens", "readwrite")
            const objectStore = transaction.objectStore("stop-tokens")

            objectStore.delete(stopToken)

            transaction.oncomplete = () => resolve()
            transaction.onerror = (event: any) => reject(event.target.error)
        })
    }

    private static async _initialize(): Promise<void> {
        if (WorkerFactory._worker_halt_tok_db === null) {
            return new Promise<void>((resolve) => {
                const openRequest = indexedDB.open("worker-halt-tokens")
                openRequest.onsuccess = (e: any) => {
                    WorkerFactory._worker_halt_tok_db = e.target.result
                    const transaction = WorkerFactory._worker_halt_tok_db.transaction(WorkerFactory._worker_halt_tok_db.objectStoreNames, 'readwrite');
                    transaction.onerror = (e: any) => console.error('Transaction error:', e.target.error)
                    // Loop through all object stores and clear them.
                    for (const storeName of transaction.objectStoreNames) {
                      const objectStore = transaction.objectStore(storeName);
                      objectStore.clear();
                    }
                    transaction.oncomplete = () => {
                      console.log('All IndexedDB data cleared.');
                    }
                    WorkerFactory._worker_halt_tok_db_Wait.resolve()
                    resolve()
                }
                openRequest.onupgradeneeded = (e: any) => {
                    WorkerFactory._worker_halt_tok_db = e.target.result
                    WorkerFactory._worker_halt_tok_db.deleteObjectStore('stop-tokens'); 
                    const objectStore = WorkerFactory._worker_halt_tok_db.createObjectStore("stop-tokens")
                    WorkerFactory._worker_halt_tok_db_Wait.resolve()
                    resolve()
                }
            })
        }
        return Promise.resolve()
    }

    static {
        (async () => {
            await WorkerFactory._initialize()
        })()
    }
}