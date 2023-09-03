export declare const REGISTERROUTE = "RegisterRoute";
export declare const CACHE_URLS = "CACHE_URLS";
export declare const CACHEFIRST = "CacheFirst";
export declare const CACHEABLERESPONSEPLUGIN = "CacheableResponsePlugin";
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
    url_origin: string;
    strategy: StrategyJson;
}
export declare class WorkboxMessageUtils {
    static postMessage(msg: WorkboxMessageJson): Promise<void>;
}
