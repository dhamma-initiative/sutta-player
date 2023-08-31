export class CacheUtils {
    public static initialise(jsRelativePath: string) {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register(jsRelativePath)
        }
    }

    public static async deleteCacheAndReloadApp(cacheName: string) {
        if ("serviceWorker" in navigator) {
            let delCount = 0
            const keys = await caches.keys()
            keys.forEach(async (cacheNm: string) => {
                if ((cacheNm === cacheName) || (cacheName === null)) {
                    await caches.delete(cacheNm)
                    delCount++
                }
            })
            if (delCount > 0)
                setTimeout(() => {window.location.replace('')}, 300)
        }
    }
}