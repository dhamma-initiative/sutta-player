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

export class CacheUtils {
    public static ENABLE_CACHE = true

    public static initialise(jsRelativePath: string, options?: RegistrationOptions) {
        if (!CacheUtils.ENABLE_CACHE)
            return
        navigator.serviceWorker.register(jsRelativePath, options)
        var refreshing = false
        navigator.serviceWorker.addEventListener('controllerchange',
          () => {
            if (refreshing) 
                return
            refreshing = true
            window.location.reload()
          }
        );
    }

    public static async isInCache(cacheName: string, urls: string[], chkResp?: (resp: Response) => boolean): Promise<boolean[]> {
        const ret: boolean[] = []
        const cache = await caches.open(cacheName)
        for (let i = 0; i < urls.length; i++) {
            const cachedResponse = await cache.match(urls[i])
            let isCached = cachedResponse?.ok ? true : false
            if (!isCached && chkResp) 
                isCached = chkResp(cachedResponse)
            ret.push(isCached)
        }
        return ret
    }

    public static async deleteCachedUrls(cacheName: string, urls: string[], options?: CacheQueryOptions): Promise<boolean[]> {
        const cache = await caches.open(cacheName)
        const ret: boolean[] = []
        for (let i = 0; i < urls.length; i++) {
            const wasDeleted = await cache.delete(urls[i], options)
            ret.push(wasDeleted)
        }
        return ret
    }

    public static async postMessage(msg: WorkboxMessageJson) {
        if (!CacheUtils.ENABLE_CACHE)
            return
        const registration = await navigator.serviceWorker.ready
        registration.active.postMessage(msg)
    }
}