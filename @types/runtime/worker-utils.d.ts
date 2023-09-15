export type WorkerMessage = {
    id: number;
    type: string;
    payload?: any;
};
export declare class WorkerFactory {
    static ID_COUNTER: number;
    static createRqstMsg(type: string, load: any): WorkerMessage;
    static createRespMsg(rqst: WorkerMessage, load: any): WorkerMessage;
}
