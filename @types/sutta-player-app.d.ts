export declare class SuttaPlayerApp {
    private static _SINGLETON;
    private _albumStorage;
    private _audioStorage;
    private _controller;
    static queryAppRoot(): string;
    start(appRoot: string): Promise<void>;
    stop(): Promise<void>;
}
