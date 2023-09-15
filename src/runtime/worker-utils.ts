export type WorkerMessage = {
    id: number
    type: string
    payload?: any
}

export class WorkerFactory {
    public static ID_COUNTER: number = 0 

    public static createRqstMsg(type: string, load: any): WorkerMessage {
        return {
            id: WorkerFactory.ID_COUNTER++,
            type: type,
            payload: load
        }
    }

    public static createRespMsg(rqst: WorkerMessage, load: any): WorkerMessage {
        rqst.payload = load // repurposing rqst!
        return rqst
    }
}