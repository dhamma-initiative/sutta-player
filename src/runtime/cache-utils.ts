export const REGISTERROUTE = 'RegisterRoute'
export const CACHE_URLS = 'CACHE_URLS'

export const CACHEFIRST = 'CacheFirst'
export const CACHEFIRST_TEXTANDDOWNLOADS = 'CacheFirst_TextAndDownloads'

export const CACHEABLERESPONSEPLUGIN = 'CacheableResponsePlugin'
export const RANGEREQUESTSPLUGIN = 'RangeRequestsPlugin'

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
    url_origin?: string
    url_href_endsWith?: string
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
        )
        return true
    }

    public static async getFromCache(cacheName: string, urls: string[]): Promise<Response[]> {
        const ret: Response[] = []
        if (!caches)
            return ret
        const cache = await caches.open(cacheName)
        for (let i = 0; i < urls.length; i++) {
            const cachedResponse = await cache.match(urls[i])
            ret.push(cachedResponse)
        }            
        return ret
    }

    public static async isInCache(cacheName: string, urls: string[], notOkRespCheck?: (resp: Response, url?: string) => boolean): Promise<boolean[]> {
        const ret: boolean[] = []
        if (!caches)
            return ret
        const cachedResponses = await CacheUtils.getFromCache(cacheName, urls)
        for (let i = 0; i < urls.length; i++) {
            let isCached = cachedResponses[i]?.ok ? true : false
            if (!isCached && notOkRespCheck) 
                isCached = notOkRespCheck(cachedResponses[i], urls[i])
            ret.push(isCached)
        }
        return ret
    }

    public static async addCachedUrls(cacheName: string, urls: string[]): Promise<boolean[]> {
        const ret: boolean[] = []
        if (!caches)
            return ret
        const cache = await caches.open(cacheName)
        for (let i = 0; i < urls.length; i++) {
            let isCached = false
            try {
                if (urls[i]) {
                    await cache.add(urls[i])
                    isCached = true
                } 
            } catch (e) {
            }
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