export type WorkerMessage = {
    id: number;
    stopToken: string;
    type: string;
    payload?: any;
};
export declare class WorkerFactory {
    static ID_COUNTER: number;
    static createRqstMsg(type: string, load: any): WorkerMessage;
    static createRespMsg(rqst: WorkerMessage, load: any): WorkerMessage;
    static createWorkerStopToken(): string;
    static signalWorkerHalt(stopToken: string): void;
    static wasWorkerHaltSignalled(stopToken: string): boolean;
}
