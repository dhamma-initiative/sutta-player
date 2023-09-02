export declare class CacheUtils {
    static initialise(jsRelativePath: string): void;
    static isInCache(cacheName: string, urls: string[], chkResp?: (resp: Response) => boolean): Promise<boolean[]>;
    static deleteCachedUrls(cacheName: string, urls: string[], options?: CacheQueryOptions): Promise<boolean[]>;
}
