export type WorkerMessage = {
    id: number;
    stopToken: string;
    type: string;
    payload?: any;
};
export declare class WorkerFactory {
    private static _worker_halt_tok_db_Wait;
    private static _worker_halt_tok_db;
    static ID_COUNTER: number;
    static createRqstMsg(type: string, load: any, existingStopToken?: string): Promise<WorkerMessage>;
    static createRespMsg(rqst: WorkerMessage, load: any): WorkerMessage;
    static createStopToken(): Promise<string>;
    static signalHalt(stopToken: string, halt?: boolean): Promise<void>;
    static wasHaltSignalled(stopToken: string): Promise<boolean>;
    static clearHalt(stopToken: string): Promise<void>;
    private static _initialize;
}
