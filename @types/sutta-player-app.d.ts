export declare class SuttaPlayerApp {
    private static _SINGLETON;
    private _suttaStorage;
    private _audioStorage;
    private _controller;
    queryAppRoot(): string;
    start(): Promise<void>;
    stop(): Promise<void>;
    setUpThemeConfig(): void;
}
