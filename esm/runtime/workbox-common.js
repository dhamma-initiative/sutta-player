export const REGISTERROUTE = 'RegisterRoute';
export const CACHE_URLS = 'CACHE_URLS';
export const CACHEFIRST = 'CacheFirst';
export const CACHEABLERESPONSEPLUGIN = 'CacheableResponsePlugin';
export class WorkboxMessageUtils {
    static async postMessage(msg) {
        const registration = await navigator.serviceWorker.ready;
        registration.active.postMessage(msg);
    }
}
//# sourceMappingURL=workbox-common.js.map