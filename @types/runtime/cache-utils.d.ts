export declare const REGISTERROUTE = "RegisterRoute";
export declare const CACHE_URLS = "CACHE_URLS";
export declare const CACHEFIRST = "CacheFirst";
export declare const CACHEFIRST_TEXTANDDOWNLOADS = "CacheFirst_TextAndDownloads";
export declare const CACHEABLERESPONSEPLUGIN = "CacheableResponsePlugin";
export declare const RANGEREQUESTSPLUGIN = "RangeRequestsPlugin";
export type WorkboxMessageJson = {
    type: string;
    payload?: any;
};
export type PluginJson = {
    class_name: string;
    options?: any;
};
export type StrategyJson = {
    class_name: string;
    cacheName: string;
    plugins?: PluginJson[];
};
export interface RegisterRoutePayloadJson {
    url_origin?: string;
    url_href_endsWith?: string;
    strategy: StrategyJson;
}
export declare class CacheUtils {
    static ENABLE_CACHE: boolean;
    static initialise(jsRelativePath: string, options?: RegistrationOptions): Promise<boolean>;
    static getFromCache(cacheName: string, urls: string[]): Promise<Response[]>;
    static isInCache(cacheName: string, urls: string[], notOkRespCheck?: (resp: Response, url?: string) => boolean): Promise<boolean[]>;
    static addCachedUrls(cacheName: string, urls: string[]): Promise<boolean[]>;
    static deleteCachedUrls(cacheName: string, urls: string[], options?: CacheQueryOptions): Promise<boolean[]>;
    static postMessage(msg: WorkboxMessageJson): Promise<void>;
}
