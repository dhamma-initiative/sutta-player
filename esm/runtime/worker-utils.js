export class WorkerFactory {
    static ID_COUNTER = 0;
    static createRqstMsg(type, load) {
        return {
            id: WorkerFactory.ID_COUNTER++,
            type: type,
            payload: load
        };
    }
    static createRespMsg(rqst, load) {
        rqst.payload = load; // repurposing rqst!
        return rqst;
    }
}
//# sourceMappingURL=worker-utils.js.map