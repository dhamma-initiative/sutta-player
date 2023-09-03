export class CacheUtils {
    public static initialise(jsRelativePath: string, options?: RegistrationOptions) {
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
        let ret: boolean[] = []
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
        // const allkeys = await cache.keys()
        // const rqst = await cache.keys(urls[0], options)
        let ret: boolean[] = []
        for (let i = 0; i < urls.length; i++) {
            const wasDeleted = await cache.delete(urls[i], options)
            ret.push(wasDeleted)
        }
        return ret
    }
}