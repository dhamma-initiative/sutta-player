import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'


declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
    ({url}) => url.origin === 'https://cdn.jsdelivr.net',
    new StaleWhileRevalidate({cacheName: 'api-response'})
)

registerRoute(
    ({url}) => url.origin === 'https://docs.google.com',
    new StaleWhileRevalidate({cacheName: 'api-response'})
)

registerRoute(
    ({url}) => url.href.endsWith('.txt'),
    new StaleWhileRevalidate({cacheName: 'api-response'})
)
