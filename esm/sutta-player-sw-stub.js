import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { CACHEABLERESPONSEPLUGIN, CACHEFIRST, REGISTERROUTE } from './runtime/cache-utils.js';
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
        throw new Error('Currently only CacheFirst is supported');
    }
    _createPlugins() {
        const plugins = [];
        let pluginsList = [];
        if (this.registerRouteJson.strategy.plugins)
            pluginsList = this.registerRouteJson.strategy.plugins;
        for (let i = 0; i < pluginsList.length; i++) {
            if (pluginsList[i].class_name === CACHEABLERESPONSEPLUGIN)
                plugins.push(new CacheableResponsePlugin(pluginsList[i].options));
            else
                throw new Error('Only CacheableResponsePlugin is supported');
        }
        return plugins;
    }
    register() {
        const strategy = this._createStrategy();
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