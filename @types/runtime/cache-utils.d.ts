export declare class CacheUtils {
    static initialise(jsRelativePath: string): void;
    static deleteCacheAndReloadApp(cacheName: string): Promise<void>;
}
