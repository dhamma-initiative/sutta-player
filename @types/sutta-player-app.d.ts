export declare class SuttaPlayerApp {
    private static _SINGLETON;
    private _suttaStorage;
    private _audioStorage;
    private _controller;
    start(): Promise<void>;
    stop(): Promise<void>;
    setUpThemeConfig(): void;
}
