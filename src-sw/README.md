https://developer.chrome.com/docs/workbox/serving-cached-audio-and-video/

https://developer.chrome.com/docs/workbox/access-caches-from-the-window/
    - https://glitch.com/edit/#!/carnelian-chestnut-gray?path=app.js%3A1%3A0

https://developer.chrome.com/docs/workbox/modules/workbox-recipes/

https://developer.chrome.com/docs/workbox/modules/workbox-window/


https://web.dev/learn/pwa/
https://web.dev/two-way-communication-guide/


chrome://inspect/#devices


import {Workbox} from 'workbox-window'

// https://developer.chrome.com/docs/workbox/modules/workbox-window/


https://stackoverflow.com/questions/41903097/how-to-force-service-worker-to-update
  If any of the files you want to precache change -- and you re-run your build -- the updated hashes in your service worker are updated which pretty much guarantees the service worker will be "at least one byte different".


workbox-utils.ts:
export class WorkboxUtils {
    public static WORKBOX: Workbox
    public static messages: string = ''

    public static create(swJsPath: string) {
        WorkboxUtils.WORKBOX = new Workbox(swJsPath)

        WorkboxUtils.WORKBOX.addEventListener('activated', event => {
            if (!event.isUpdate) {
                WorkboxUtils.messages += 'Service worker activated for the first time!'
          
              // If your service worker is configured to precache assets, those
              // assets should all be available now.
            }
        })
        WorkboxUtils.WORKBOX.addEventListener('waiting', event => {
            WorkboxUtils.messages += 
              `A new service worker has installed, but it can't activate until all tabs running the current version have fully unloaded.`
        })
        WorkboxUtils.WORKBOX.addEventListener('message', event => {
            if (event.data.type === 'CACHE_UPDATED') {
              const {updatedURL} = event.data.payload;
              WorkboxUtils.messages += `A newer version of ${updatedURL} is available!`
            }
          })
    }

    public static register() {
        WorkboxUtils.WORKBOX.register()
    }
}