export type WorkerMessage = {
    id: number
    stopToken: string
    type: string
    payload?: any
}

export class WorkerFactory {
    public static ID_COUNTER: number = 0 

    public static createRqstMsg(type: string, load: any): WorkerMessage {
        return {
            id: WorkerFactory.ID_COUNTER++,
            stopToken: WorkerFactory.createWorkerStopToken(),
            type: type,
            payload: load
        }
    }

    public static createRespMsg(rqst: WorkerMessage, load: any): WorkerMessage {
        rqst.payload = load // repurposing rqst!
        return rqst
    }

    // credit for the following: https://yoyo-code.com/how-to-stop-synchronous-web-worker/
    public static createWorkerStopToken(): string {
        return URL.createObjectURL(new Blob())
    }

    public static signalWorkerHalt(stopToken: string): void {
        return URL.revokeObjectURL(stopToken)
    }

    public static wasWorkerHaltSignalled(stopToken: string): boolean {
        let xhr = new XMLHttpRequest()
        xhr.open("GET", stopToken, /* async= */false);
        try {
            xhr.send(null)
        } catch (e) {
            return true // request failed, URL has been revoked
        }
        return false // URL is still valid, we can continue
    }
}