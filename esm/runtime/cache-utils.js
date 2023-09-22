export const REGISTERROUTE = 'RegisterRoute';
export const CACHE_URLS = 'CACHE_URLS';
export const CACHEFIRST = 'CacheFirst';
export const CACHEFIRST_TEXTANDDOWNLOADS = 'CacheFirst_TextAndDownloads';
export const CACHEABLERESPONSEPLUGIN = 'CacheableResponsePlugin';
export const RANGEREQUESTSPLUGIN = 'RangeRequestsPlugin';
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
    static async getFromCache(cacheName, urls) {
        const ret = [];
        if (!caches)
            return ret;
        const cache = await caches.open(cacheName);
        for (let i = 0; i < urls.length; i++) {
            const cachedResponse = await cache.match(urls[i]);
            ret.push(cachedResponse);
        }
        return ret;
    }
    static async isInCache(cacheName, urls, notOkRespCheck) {
        const ret = [];
        if (!caches)
            return ret;
        const cachedResponses = await CacheUtils.getFromCache(cacheName, urls);
        for (let i = 0; i < urls.length; i++) {
            let isCached = cachedResponses[i]?.ok ? true : false;
            if (!isCached && notOkRespCheck)
                isCached = notOkRespCheck(cachedResponses[i], urls[i]);
            ret.push(isCached);
        }
        return ret;
    }
    static async addCachedUrls(cacheName, urls) {
        const ret = [];
        if (!caches)
            return ret;
        const cache = await caches.open(cacheName);
        for (let i = 0; i < urls.length; i++) {
            let isCached = false;
            try {
                if (urls[i]) {
                    await cache.add(urls[i]);
                    isCached = true;
                }
            }
            catch (e) {
            }
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