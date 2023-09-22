import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { precacheAndRoute } from 'workbox-precaching';
import { RangeRequestsPlugin } from 'workbox-range-requests';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { CACHEABLERESPONSEPLUGIN, CACHEFIRST, CACHEFIRST_TEXTANDDOWNLOADS, RANGEREQUESTSPLUGIN, REGISTERROUTE } from './runtime/cache-utils.js';
precacheAndRoute(self.__WB_MANIFEST);
class RouteFactory {
    registerRouteJson;
    constructor(regRtJson) {
        this.registerRouteJson = regRtJson;
    }
    _createStrategy() {
        if (this.registerRouteJson.strategy.class_name === CACHEFIRST) {
            const args = this.registerRouteJson.strategy;
            const plugins = this._createPlugins();
            if (plugins.length > 0)
                args.plugins = plugins;
            return new CacheFirst({ cacheName: args.cacheName, plugins: args.plugins });
        }
        else if (this.registerRouteJson.strategy.class_name === CACHEFIRST_TEXTANDDOWNLOADS) {
            return this._createCacheFirstTextAndDownloadsStrategy();
        }
        throw new Error('Currently only CacheFirst & CacheFirst_TextAndDownloads are supported');
    }
    _createCacheFirstTextAndDownloadsStrategy() {
        const ret = async ({ event }) => {
            try {
                const request = event.request.clone();
                const cache = await caches.open(this.registerRouteJson.strategy.cacheName);
                let response = await cache.match(request.url);
                if (response)
                    return response;
                response = await fetch(request);
                if (this._isAudioUrl(request.url)) {
                    if (response.status === 206)
                        return response; // by-pass adding to cache
                    response = await fetch(request.url);
                }
                else
                    response = await fetch(request);
                await cache.put(request, response.clone());
                return response;
            }
            catch (error) {
                console.log(error);
            }
        };
        return ret;
    }
    _isAudioUrl(url) {
        return url.endsWith('.mp3') || url.endsWith('.wav');
    }
    _createPlugins() {
        const plugins = [];
        let pluginsList = [];
        if (this.registerRouteJson.strategy.plugins)
            pluginsList = this.registerRouteJson.strategy.plugins;
        for (let i = 0; i < pluginsList.length; i++) {
            if (pluginsList[i].class_name === CACHEABLERESPONSEPLUGIN)
                plugins.push(new CacheableResponsePlugin(pluginsList[i].options));
            else if (pluginsList[i].class_name === RANGEREQUESTSPLUGIN)
                plugins.push(new RangeRequestsPlugin());
            else
                throw new Error('Only CacheableResponsePlugin & RangeRequestsPlugin are supported');
        }
        return plugins;
    }
    register() {
        const strategy = this._createStrategy();
        if (this.registerRouteJson.url_origin)
            registerRoute(({ url }) => url.origin === this.registerRouteJson.url_origin, strategy);
    }
}
addEventListener("message", (event) => {
    if (event.data.type === REGISTERROUTE) {
        const regRouteMsg = event.data.payload;
        const dynRouteCreater = new RouteFactory(regRouteMsg);
        dynRouteCreater.register();
    }
});
//# sourceMappingURL=sutta-player-sw-stub.js.map