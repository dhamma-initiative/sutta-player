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

    public static async initialise(jsRelativePath: string, options?: RegistrationOptions): Promise<boolean> {
        if (!CacheUtils.ENABLE_CACHE)
            return false
        if (!navigator.serviceWorker)
            return false
        const registration = await navigator.serviceWorker.register(jsRelativePath, options)
        console.log('Service-worker registration completed.')
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
        if (!caches)
            return ret
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
        const ret: boolean[] = []
        if (!caches)
            return ret
        const cache = await caches.open(cacheName)
        for (let i = 0; i < urls.length; i++) {
            const wasDeleted = await cache.delete(urls[i], options)
            ret.push(wasDeleted)
        }
        return ret
    }

    public static async postMessage(msg: WorkboxMessageJson): Promise<void> {
        if (!CacheUtils.ENABLE_CACHE)
            return
        if (!navigator.serviceWorker)
            return
        const registration = await navigator.serviceWorker.ready
        registration.active.postMessage(msg)
    }
}