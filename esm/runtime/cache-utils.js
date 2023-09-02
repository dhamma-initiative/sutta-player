export class CacheUtils {
    static initialise(jsRelativePath) {
        navigator.serviceWorker.register(jsRelativePath);
        var refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing)
                return;
            refreshing = true;
            window.location.reload();
        });
    }
    static async isInCache(cacheName, urls, chkResp) {
        let ret = [];
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
        const cache = await caches.open(cacheName);
        // const allkeys = await cache.keys()
        // const rqst = await cache.keys(urls[0], options)
        let ret = [];
        for (let i = 0; i < urls.length; i++) {
            const wasDeleted = await cache.delete(urls[i], options);
            ret.push(wasDeleted);
        }
        return ret;
    }
}
//# sourceMappingURL=cache-utils.js.map