export const REGISTERROUTE = 'RegisterRoute'
export const CACHE_URLS = 'CACHE_URLS'

export const CACHEFIRST = 'CacheFirst'
export const CACHEABLERESPONSEPLUGIN = 'CacheableResponsePlugin'

export type WorkboxMessageJson = {
    type: string
    payload?: any
}

export type PluginJson = {
    class_name: string
    options?: any
}

export type StrategyJson = {
    class_name: string
    cacheName: string
    plugins?: PluginJson[]
}

export interface RegisterRoutePayloadJson {
    url_origin: string
    strategy: StrategyJson
}

export class WorkboxMessageUtils {
    public static async postMessage(msg: WorkboxMessageJson) {
        const registration = await navigator.serviceWorker.ready
        registration.active.postMessage(msg)
    }
}