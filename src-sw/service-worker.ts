import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'


declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
    ({url}) => url.origin === 'https://cdn.jsdelivr.net',
    new CacheFirst({cacheName: 'cdn.jsdelivr.net'})
)

registerRoute(
    ({url}) => url.origin === 'https://docs.google.com',
    new CacheFirst({
        cacheName: 'docs.google.com',
        plugins: [
            new CacheableResponsePlugin({
              statuses: [0, 200]
            }),
          ],    
    })
)