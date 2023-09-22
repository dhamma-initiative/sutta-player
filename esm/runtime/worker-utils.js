export class WorkerFactory {
    static ID_COUNTER = 0;
    static createRqstMsg(type, load) {
        return {
            id: WorkerFactory.ID_COUNTER++,
            stopToken: WorkerFactory.createWorkerStopToken(),
            type: type,
            payload: load
        };
    }
    static createRespMsg(rqst, load) {
        rqst.payload = load; // repurposing rqst!
        return rqst;
    }
    // credit for the following: https://yoyo-code.com/how-to-stop-synchronous-web-worker/
    static createWorkerStopToken() {
        return URL.createObjectURL(new Blob());
    }
    static signalWorkerHalt(stopToken) {
        return URL.revokeObjectURL(stopToken);
    }
    static wasWorkerHaltSignalled(stopToken) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", stopToken, /* async= */ false);
        try {
            xhr.send(null);
        }
        catch (e) {
            return true; // request failed, URL has been revoked
        }
        return false; // URL is still valid, we can continue
    }
}
//# sourceMappingURL=worker-utils.js.map