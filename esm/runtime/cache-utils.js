export class CacheUtils {
    static initialise(jsRelativePath) {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register(jsRelativePath);
        }
    }
    static async deleteCacheAndReloadApp(cacheName) {
        if ("serviceWorker" in navigator) {
            let delCount = 0;
            const keys = await caches.keys();
            keys.forEach(async (cacheNm) => {
                if ((cacheNm === cacheName) || (cacheName === null)) {
                    await caches.delete(cacheNm);
                    delCount++;
                }
            });
            if (delCount > 0)
                setTimeout(() => { window.location.replace(''); }, 300);
        }
    }
}
//# sourceMappingURL=cache-utils.js.map