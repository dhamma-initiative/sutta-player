import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'

import { CACHEABLERESPONSEPLUGIN, CACHEFIRST, PluginJson, REGISTERROUTE, RegisterRoutePayloadJson } from './runtime/workbox-common.js'

declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)

class RouteFactory {
  registerRouteJson: RegisterRoutePayloadJson

  constructor(regRtJson: RegisterRoutePayloadJson) {
    this.registerRouteJson = regRtJson
  }

  private _createStrategy() {
    if (this.registerRouteJson.strategy.class_name === CACHEFIRST) {
      let args = this.registerRouteJson.strategy
      let plugins = this._createPlugins()
      if (plugins.length > 0)
        args.plugins = plugins
      return new CacheFirst({cacheName: args.cacheName, plugins: <any>args.plugins})
    }
    throw new Error('Currently only CacheFirst is supported')
  }

  private _createPlugins() {
    let plugins: any[] = []
    let pluginsList: PluginJson[] = []
    if (this.registerRouteJson.strategy.plugins)
      pluginsList = this.registerRouteJson.strategy.plugins
    for (let i = 0; i < pluginsList.length; i++) {
      if (pluginsList[i].class_name === CACHEABLERESPONSEPLUGIN) 
        plugins.push(new CacheableResponsePlugin(pluginsList[i].options))
      else
        throw new Error('Only CacheableResponsePlugin is supported')
    }
    return plugins
  }

  public register() {
    const strategy = this._createStrategy()
    registerRoute(
      ({url}) => url.origin === this.registerRouteJson.url_origin,
      strategy      
    )
  }
}

addEventListener("message", (event) => {
  if (event.data.type === REGISTERROUTE) {
    const regRouteMsg = <RegisterRoutePayloadJson> event.data.payload
    let dynRouteCreater = new RouteFactory(regRouteMsg)
    dynRouteCreater.register()
  }
})