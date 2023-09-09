export const REGISTERROUTE = 'RegisterRoute';
export const CACHE_URLS = 'CACHE_URLS';
export const CACHEFIRST = 'CacheFirst';
export const CACHEABLERESPONSEPLUGIN = 'CacheableResponsePlugin';
export class CacheUtils {
    static ENABLE_CACHE = true;
    static async initialise(jsRelativePath, options) {
        if (!CacheUtils.ENABLE_CACHE)
            return false;
        if (!navigator.serviceWorker)
            return false;
        const registration = await navigator.serviceWorker.register(jsRelativePath, options);
        console.log('Service-worker registration completed.');
        var refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing)
                return;
            refreshing = true;
            window.location.reload();
        });
        return true;
    }
    static async isInCache(cacheName, urls, chkResp) {
        const ret = [];
        if (!caches)
            return ret;
        const cache = await caches.open(cacheName);
        for (let i = 0; i < urls.length; i++) {
            const cachedResponse = await cache.match(urls[i]);
            let isCached = cachedResponse?.ok ? true : false;
            if (!isCached && chkResp)
                isCached = chkResp(cachedResponse);
            ret.push(isCached);
        }
        return ret;
    }
    static async deleteCachedUrls(cacheName, urls, options) {
        const ret = [];
        if (!caches)
            return ret;
        const cache = await caches.open(cacheName);
        for (let i = 0; i < urls.length; i++) {
            const wasDeleted = await cache.delete(urls[i], options);
            ret.push(wasDeleted);
        }
        return ret;
    }
    static async postMessage(msg) {
        if (!CacheUtils.ENABLE_CACHE)
            return;
        if (!navigator.serviceWorker)
            return;
        const registration = await navigator.serviceWorker.ready;
        registration.active.postMessage(msg);
    }
}
//# sourceMappingURL=cache-utils.js.map