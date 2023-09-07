"use strict";
(() => {
  // node_modules/workbox-core/_version.js
  try {
    self["workbox:core:7.0.0"] && _();
  } catch (e) {
  }

  // node_modules/workbox-core/models/messages/messages.js
  var messages = {
    "invalid-value": ({ paramName, validValueDescription, value }) => {
      if (!paramName || !validValueDescription) {
        throw new Error(`Unexpected input to 'invalid-value' error.`);
      }
      return `The '${paramName}' parameter was given a value with an unexpected value. ${validValueDescription} Received a value of ${JSON.stringify(value)}.`;
    },
    "not-an-array": ({ moduleName, className, funcName, paramName }) => {
      if (!moduleName || !className || !funcName || !paramName) {
        throw new Error(`Unexpected input to 'not-an-array' error.`);
      }
      return `The parameter '${paramName}' passed into '${moduleName}.${className}.${funcName}()' must be an array.`;
    },
    "incorrect-type": ({ expectedType, paramName, moduleName, className, funcName }) => {
      if (!expectedType || !paramName || !moduleName || !funcName) {
        throw new Error(`Unexpected input to 'incorrect-type' error.`);
      }
      const classNameStr = className ? `${className}.` : "";
      return `The parameter '${paramName}' passed into '${moduleName}.${classNameStr}${funcName}()' must be of type ${expectedType}.`;
    },
    "incorrect-class": ({ expectedClassName, paramName, moduleName, className, funcName, isReturnValueProblem }) => {
      if (!expectedClassName || !moduleName || !funcName) {
        throw new Error(`Unexpected input to 'incorrect-class' error.`);
      }
      const classNameStr = className ? `${className}.` : "";
      if (isReturnValueProblem) {
        return `The return value from '${moduleName}.${classNameStr}${funcName}()' must be an instance of class ${expectedClassName}.`;
      }
      return `The parameter '${paramName}' passed into '${moduleName}.${classNameStr}${funcName}()' must be an instance of class ${expectedClassName}.`;
    },
    "missing-a-method": ({ expectedMethod, paramName, moduleName, className, funcName }) => {
      if (!expectedMethod || !paramName || !moduleName || !className || !funcName) {
        throw new Error(`Unexpected input to 'missing-a-method' error.`);
      }
      return `${moduleName}.${className}.${funcName}() expected the '${paramName}' parameter to expose a '${expectedMethod}' method.`;
    },
    "add-to-cache-list-unexpected-type": ({ entry }) => {
      return `An unexpected entry was passed to 'workbox-precaching.PrecacheController.addToCacheList()' The entry '${JSON.stringify(entry)}' isn't supported. You must supply an array of strings with one or more characters, objects with a url property or Request objects.`;
    },
    "add-to-cache-list-conflicting-entries": ({ firstEntry, secondEntry }) => {
      if (!firstEntry || !secondEntry) {
        throw new Error(`Unexpected input to 'add-to-cache-list-duplicate-entries' error.`);
      }
      return `Two of the entries passed to 'workbox-precaching.PrecacheController.addToCacheList()' had the URL ${firstEntry} but different revision details. Workbox is unable to cache and version the asset correctly. Please remove one of the entries.`;
    },
    "plugin-error-request-will-fetch": ({ thrownErrorMessage }) => {
      if (!thrownErrorMessage) {
        throw new Error(`Unexpected input to 'plugin-error-request-will-fetch', error.`);
      }
      return `An error was thrown by a plugins 'requestWillFetch()' method. The thrown error message was: '${thrownErrorMessage}'.`;
    },
    "invalid-cache-name": ({ cacheNameId, value }) => {
      if (!cacheNameId) {
        throw new Error(`Expected a 'cacheNameId' for error 'invalid-cache-name'`);
      }
      return `You must provide a name containing at least one character for setCacheDetails({${cacheNameId}: '...'}). Received a value of '${JSON.stringify(value)}'`;
    },
    "unregister-route-but-not-found-with-method": ({ method }) => {
      if (!method) {
        throw new Error(`Unexpected input to 'unregister-route-but-not-found-with-method' error.`);
      }
      return `The route you're trying to unregister was not  previously registered for the method type '${method}'.`;
    },
    "unregister-route-route-not-registered": () => {
      return `The route you're trying to unregister was not previously registered.`;
    },
    "queue-replay-failed": ({ name }) => {
      return `Replaying the background sync queue '${name}' failed.`;
    },
    "duplicate-queue-name": ({ name }) => {
      return `The Queue name '${name}' is already being used. All instances of backgroundSync.Queue must be given unique names.`;
    },
    "expired-test-without-max-age": ({ methodName, paramName }) => {
      return `The '${methodName}()' method can only be used when the '${paramName}' is used in the constructor.`;
    },
    "unsupported-route-type": ({ moduleName, className, funcName, paramName }) => {
      return `The supplied '${paramName}' parameter was an unsupported type. Please check the docs for ${moduleName}.${className}.${funcName} for valid input types.`;
    },
    "not-array-of-class": ({ value, expectedClass, moduleName, className, funcName, paramName }) => {
      return `The supplied '${paramName}' parameter must be an array of '${expectedClass}' objects. Received '${JSON.stringify(value)},'. Please check the call to ${moduleName}.${className}.${funcName}() to fix the issue.`;
    },
    "max-entries-or-age-required": ({ moduleName, className, funcName }) => {
      return `You must define either config.maxEntries or config.maxAgeSecondsin ${moduleName}.${className}.${funcName}`;
    },
    "statuses-or-headers-required": ({ moduleName, className, funcName }) => {
      return `You must define either config.statuses or config.headersin ${moduleName}.${className}.${funcName}`;
    },
    "invalid-string": ({ moduleName, funcName, paramName }) => {
      if (!paramName || !moduleName || !funcName) {
        throw new Error(`Unexpected input to 'invalid-string' error.`);
      }
      return `When using strings, the '${paramName}' parameter must start with 'http' (for cross-origin matches) or '/' (for same-origin matches). Please see the docs for ${moduleName}.${funcName}() for more info.`;
    },
    "channel-name-required": () => {
      return `You must provide a channelName to construct a BroadcastCacheUpdate instance.`;
    },
    "invalid-responses-are-same-args": () => {
      return `The arguments passed into responsesAreSame() appear to be invalid. Please ensure valid Responses are used.`;
    },
    "expire-custom-caches-only": () => {
      return `You must provide a 'cacheName' property when using the expiration plugin with a runtime caching strategy.`;
    },
    "unit-must-be-bytes": ({ normalizedRangeHeader }) => {
      if (!normalizedRangeHeader) {
        throw new Error(`Unexpected input to 'unit-must-be-bytes' error.`);
      }
      return `The 'unit' portion of the Range header must be set to 'bytes'. The Range header provided was "${normalizedRangeHeader}"`;
    },
    "single-range-only": ({ normalizedRangeHeader }) => {
      if (!normalizedRangeHeader) {
        throw new Error(`Unexpected input to 'single-range-only' error.`);
      }
      return `Multiple ranges are not supported. Please use a  single start value, and optional end value. The Range header provided was "${normalizedRangeHeader}"`;
    },
    "invalid-range-values": ({ normalizedRangeHeader }) => {
      if (!normalizedRangeHeader) {
        throw new Error(`Unexpected input to 'invalid-range-values' error.`);
      }
      return `The Range header is missing both start and end values. At least one of those values is needed. The Range header provided was "${normalizedRangeHeader}"`;
    },
    "no-range-header": () => {
      return `No Range header was found in the Request provided.`;
    },
    "range-not-satisfiable": ({ size, start, end }) => {
      return `The start (${start}) and end (${end}) values in the Range are not satisfiable by the cached response, which is ${size} bytes.`;
    },
    "attempt-to-cache-non-get-request": ({ url, method }) => {
      return `Unable to cache '${url}' because it is a '${method}' request and only 'GET' requests can be cached.`;
    },
    "cache-put-with-no-response": ({ url }) => {
      return `There was an attempt to cache '${url}' but the response was not defined.`;
    },
    "no-response": ({ url, error }) => {
      let message = `The strategy could not generate a response for '${url}'.`;
      if (error) {
        message += ` The underlying error is ${error}.`;
      }
      return message;
    },
    "bad-precaching-response": ({ url, status }) => {
      return `The precaching request for '${url}' failed` + (status ? ` with an HTTP status of ${status}.` : `.`);
    },
    "non-precached-url": ({ url }) => {
      return `createHandlerBoundToURL('${url}') was called, but that URL is not precached. Please pass in a URL that is precached instead.`;
    },
    "add-to-cache-list-conflicting-integrities": ({ url }) => {
      return `Two of the entries passed to 'workbox-precaching.PrecacheController.addToCacheList()' had the URL ${url} with different integrity values. Please remove one of them.`;
    },
    "missing-precache-entry": ({ cacheName, url }) => {
      return `Unable to find a precached response in ${cacheName} for ${url}.`;
    },
    "cross-origin-copy-response": ({ origin }) => {
      return `workbox-core.copyResponse() can only be used with same-origin responses. It was passed a response with origin ${origin}.`;
    },
    "opaque-streams-source": ({ type }) => {
      const message = `One of the workbox-streams sources resulted in an '${type}' response.`;
      if (type === "opaqueredirect") {
        return `${message} Please do not use a navigation request that results in a redirect as a source.`;
      }
      return `${message} Please ensure your sources are CORS-enabled.`;
    }
  };

  // node_modules/workbox-core/models/messages/messageGenerator.js
  var generatorFunction = (code, details = {}) => {
    const message = messages[code];
    if (!message) {
      throw new Error(`Unable to find message for code '${code}'.`);
    }
    return message(details);
  };
  var messageGenerator = false ? fallback : generatorFunction;

  // node_modules/workbox-core/_private/WorkboxError.js
  var WorkboxError = class extends Error {
    /**
     *
     * @param {string} errorCode The error code that
     * identifies this particular error.
     * @param {Object=} details Any relevant arguments
     * that will help developers identify issues should
     * be added as a key on the context object.
     */
    constructor(errorCode, details) {
      const message = messageGenerator(errorCode, details);
      super(message);
      this.name = errorCode;
      this.details = details;
    }
  };

  // node_modules/workbox-core/_private/assert.js
  var isArray = (value, details) => {
    if (!Array.isArray(value)) {
      throw new WorkboxError("not-an-array", details);
    }
  };
  var hasMethod = (object, expectedMethod, details) => {
    const type = typeof object[expectedMethod];
    if (type !== "function") {
      details["expectedMethod"] = expectedMethod;
      throw new WorkboxError("missing-a-method", details);
    }
  };
  var isType = (object, expectedType, details) => {
    if (typeof object !== expectedType) {
      details["expectedType"] = expectedType;
      throw new WorkboxError("incorrect-type", details);
    }
  };
  var isInstance = (object, expectedClass, details) => {
    if (!(object instanceof expectedClass)) {
      details["expectedClassName"] = expectedClass.name;
      throw new WorkboxError("incorrect-class", details);
    }
  };
  var isOneOf = (value, validValues, details) => {
    if (!validValues.includes(value)) {
      details["validValueDescription"] = `Valid values are ${JSON.stringify(validValues)}.`;
      throw new WorkboxError("invalid-value", details);
    }
  };
  var isArrayOfClass = (value, expectedClass, details) => {
    const error = new WorkboxError("not-array-of-class", details);
    if (!Array.isArray(value)) {
      throw error;
    }
    for (const item of value) {
      if (!(item instanceof expectedClass)) {
        throw error;
      }
    }
  };
  var finalAssertExports = false ? null : {
    hasMethod,
    isArray,
    isInstance,
    isOneOf,
    isType,
    isArrayOfClass
  };

  // node_modules/workbox-core/_private/getFriendlyURL.js
  var getFriendlyURL = (url) => {
    const urlObj = new URL(String(url), location.href);
    return urlObj.href.replace(new RegExp(`^${location.origin}`), "");
  };

  // node_modules/workbox-core/_private/logger.js
  var logger = false ? null : (() => {
    if (!("__WB_DISABLE_DEV_LOGS" in globalThis)) {
      self.__WB_DISABLE_DEV_LOGS = false;
    }
    let inGroup = false;
    const methodToColorMap = {
      debug: `#7f8c8d`,
      log: `#2ecc71`,
      warn: `#f39c12`,
      error: `#c0392b`,
      groupCollapsed: `#3498db`,
      groupEnd: null
      // No colored prefix on groupEnd
    };
    const print = function(method, args) {
      if (self.__WB_DISABLE_DEV_LOGS) {
        return;
      }
      if (method === "groupCollapsed") {
        if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
          console[method](...args);
          return;
        }
      }
      const styles = [
        `background: ${methodToColorMap[method]}`,
        `border-radius: 0.5em`,
        `color: white`,
        `font-weight: bold`,
        `padding: 2px 0.5em`
      ];
      const logPrefix = inGroup ? [] : ["%cworkbox", styles.join(";")];
      console[method](...logPrefix, ...args);
      if (method === "groupCollapsed") {
        inGroup = true;
      }
      if (method === "groupEnd") {
        inGroup = false;
      }
    };
    const api = {};
    const loggerMethods = Object.keys(methodToColorMap);
    for (const key of loggerMethods) {
      const method = key;
      api[method] = (...args) => {
        print(method, args);
      };
    }
    return api;
  })();

  // node_modules/workbox-cacheable-response/_version.js
  try {
    self["workbox:cacheable-response:7.0.0"] && _();
  } catch (e) {
  }

  // node_modules/workbox-cacheable-response/CacheableResponse.js
  var CacheableResponse = class {
    /**
     * To construct a new CacheableResponse instance you must provide at least
     * one of the `config` properties.
     *
     * If both `statuses` and `headers` are specified, then both conditions must
     * be met for the `Response` to be considered cacheable.
     *
     * @param {Object} config
     * @param {Array<number>} [config.statuses] One or more status codes that a
     * `Response` can have and be considered cacheable.
     * @param {Object<string,string>} [config.headers] A mapping of header names
     * and expected values that a `Response` can have and be considered cacheable.
     * If multiple headers are provided, only one needs to be present.
     */
    constructor(config = {}) {
      if (true) {
        if (!(config.statuses || config.headers)) {
          throw new WorkboxError("statuses-or-headers-required", {
            moduleName: "workbox-cacheable-response",
            className: "CacheableResponse",
            funcName: "constructor"
          });
        }
        if (config.statuses) {
          finalAssertExports.isArray(config.statuses, {
            moduleName: "workbox-cacheable-response",
            className: "CacheableResponse",
            funcName: "constructor",
            paramName: "config.statuses"
          });
        }
        if (config.headers) {
          finalAssertExports.isType(config.headers, "object", {
            moduleName: "workbox-cacheable-response",
            className: "CacheableResponse",
            funcName: "constructor",
            paramName: "config.headers"
          });
        }
      }
      this._statuses = config.statuses;
      this._headers = config.headers;
    }
    /**
     * Checks a response to see whether it's cacheable or not, based on this
     * object's configuration.
     *
     * @param {Response} response The response whose cacheability is being
     * checked.
     * @return {boolean} `true` if the `Response` is cacheable, and `false`
     * otherwise.
     */
    isResponseCacheable(response) {
      if (true) {
        finalAssertExports.isInstance(response, Response, {
          moduleName: "workbox-cacheable-response",
          className: "CacheableResponse",
          funcName: "isResponseCacheable",
          paramName: "response"
        });
      }
      let cacheable = true;
      if (this._statuses) {
        cacheable = this._statuses.includes(response.status);
      }
      if (this._headers && cacheable) {
        cacheable = Object.keys(this._headers).some((headerName) => {
          return response.headers.get(headerName) === this._headers[headerName];
        });
      }
      if (true) {
        if (!cacheable) {
          logger.groupCollapsed(`The request for '${getFriendlyURL(response.url)}' returned a response that does not meet the criteria for being cached.`);
          logger.groupCollapsed(`View cacheability criteria here.`);
          logger.log(`Cacheable statuses: ` + JSON.stringify(this._statuses));
          logger.log(`Cacheable headers: ` + JSON.stringify(this._headers, null, 2));
          logger.groupEnd();
          const logFriendlyHeaders = {};
          response.headers.forEach((value, key) => {
            logFriendlyHeaders[key] = value;
          });
          logger.groupCollapsed(`View response status and headers here.`);
          logger.log(`Response status: ${response.status}`);
          logger.log(`Response headers: ` + JSON.stringify(logFriendlyHeaders, null, 2));
          logger.groupEnd();
          logger.groupCollapsed(`View full response details here.`);
          logger.log(response.headers);
          logger.log(response);
          logger.groupEnd();
          logger.groupEnd();
        }
      }
      return cacheable;
    }
  };

  // node_modules/workbox-cacheable-response/CacheableResponsePlugin.js
  var CacheableResponsePlugin = class {
    /**
     * To construct a new CacheableResponsePlugin instance you must provide at
     * least one of the `config` properties.
     *
     * If both `statuses` and `headers` are specified, then both conditions must
     * be met for the `Response` to be considered cacheable.
     *
     * @param {Object} config
     * @param {Array<number>} [config.statuses] One or more status codes that a
     * `Response` can have and be considered cacheable.
     * @param {Object<string,string>} [config.headers] A mapping of header names
     * and expected values that a `Response` can have and be considered cacheable.
     * If multiple headers are provided, only one needs to be present.
     */
    constructor(config) {
      this.cacheWillUpdate = async ({ response }) => {
        if (this._cacheableResponse.isResponseCacheable(response)) {
          return response;
        }
        return null;
      };
      this._cacheableResponse = new CacheableResponse(config);
    }
  };

  // node_modules/workbox-core/_private/cacheNames.js
  var _cacheNameDetails = {
    googleAnalytics: "googleAnalytics",
    precache: "precache-v2",
    prefix: "workbox",
    runtime: "runtime",
    suffix: typeof registration !== "undefined" ? registration.scope : ""
  };
  var _createCacheName = (cacheName) => {
    return [_cacheNameDetails.prefix, cacheName, _cacheNameDetails.suffix].filter((value) => value && value.length > 0).join("-");
  };
  var eachCacheNameDetail = (fn) => {
    for (const key of Object.keys(_cacheNameDetails)) {
      fn(key);
    }
  };
  var cacheNames = {
    updateDetails: (details) => {
      eachCacheNameDetail((key) => {
        if (typeof details[key] === "string") {
          _cacheNameDetails[key] = details[key];
        }
      });
    },
    getGoogleAnalyticsName: (userCacheName) => {
      return userCacheName || _createCacheName(_cacheNameDetails.googleAnalytics);
    },
    getPrecacheName: (userCacheName) => {
      return userCacheName || _createCacheName(_cacheNameDetails.precache);
    },
    getPrefix: () => {
      return _cacheNameDetails.prefix;
    },
    getRuntimeName: (userCacheName) => {
      return userCacheName || _createCacheName(_cacheNameDetails.runtime);
    },
    getSuffix: () => {
      return _cacheNameDetails.suffix;
    }
  };

  // node_modules/workbox-core/_private/waitUntil.js
  function waitUntil(event, asyncFn) {
    const returnPromise = asyncFn();
    event.waitUntil(returnPromise);
    return returnPromise;
  }

  // node_modules/workbox-precaching/_version.js
  try {
    self["workbox:precaching:7.0.0"] && _();
  } catch (e) {
  }

  // node_modules/workbox-precaching/utils/createCacheKey.js
  var REVISION_SEARCH_PARAM = "__WB_REVISION__";
  function createCacheKey(entry) {
    if (!entry) {
      throw new WorkboxError("add-to-cache-list-unexpected-type", { entry });
    }
    if (typeof entry === "string") {
      const urlObject = new URL(entry, location.href);
      return {
        cacheKey: urlObject.href,
        url: urlObject.href
      };
    }
    const { revision, url } = entry;
    if (!url) {
      throw new WorkboxError("add-to-cache-list-unexpected-type", { entry });
    }
    if (!revision) {
      const urlObject = new URL(url, location.href);
      return {
        cacheKey: urlObject.href,
        url: urlObject.href
      };
    }
    const cacheKeyURL = new URL(url, location.href);
    const originalURL = new URL(url, location.href);
    cacheKeyURL.searchParams.set(REVISION_SEARCH_PARAM, revision);
    return {
      cacheKey: cacheKeyURL.href,
      url: originalURL.href
    };
  }

  // node_modules/workbox-precaching/utils/PrecacheInstallReportPlugin.js
  var PrecacheInstallReportPlugin = class {
    constructor() {
      this.updatedURLs = [];
      this.notUpdatedURLs = [];
      this.handlerWillStart = async ({ request, state }) => {
        if (state) {
          state.originalRequest = request;
        }
      };
      this.cachedResponseWillBeUsed = async ({ event, state, cachedResponse }) => {
        if (event.type === "install") {
          if (state && state.originalRequest && state.originalRequest instanceof Request) {
            const url = state.originalRequest.url;
            if (cachedResponse) {
              this.notUpdatedURLs.push(url);
            } else {
              this.updatedURLs.push(url);
            }
          }
        }
        return cachedResponse;
      };
    }
  };

  // node_modules/workbox-precaching/utils/PrecacheCacheKeyPlugin.js
  var PrecacheCacheKeyPlugin = class {
    constructor({ precacheController: precacheController2 }) {
      this.cacheKeyWillBeUsed = async ({ request, params }) => {
        const cacheKey = (params === null || params === void 0 ? void 0 : params.cacheKey) || this._precacheController.getCacheKeyForURL(request.url);
        return cacheKey ? new Request(cacheKey, { headers: request.headers }) : request;
      };
      this._precacheController = precacheController2;
    }
  };

  // node_modules/workbox-precaching/utils/printCleanupDetails.js
  var logGroup = (groupTitle, deletedURLs) => {
    logger.groupCollapsed(groupTitle);
    for (const url of deletedURLs) {
      logger.log(url);
    }
    logger.groupEnd();
  };
  function printCleanupDetails(deletedURLs) {
    const deletionCount = deletedURLs.length;
    if (deletionCount > 0) {
      logger.groupCollapsed(`During precaching cleanup, ${deletionCount} cached request${deletionCount === 1 ? " was" : "s were"} deleted.`);
      logGroup("Deleted Cache Requests", deletedURLs);
      logger.groupEnd();
    }
  }

  // node_modules/workbox-precaching/utils/printInstallDetails.js
  function _nestedGroup(groupTitle, urls) {
    if (urls.length === 0) {
      return;
    }
    logger.groupCollapsed(groupTitle);
    for (const url of urls) {
      logger.log(url);
    }
    logger.groupEnd();
  }
  function printInstallDetails(urlsToPrecache, urlsAlreadyPrecached) {
    const precachedCount = urlsToPrecache.length;
    const alreadyPrecachedCount = urlsAlreadyPrecached.length;
    if (precachedCount || alreadyPrecachedCount) {
      let message = `Precaching ${precachedCount} file${precachedCount === 1 ? "" : "s"}.`;
      if (alreadyPrecachedCount > 0) {
        message += ` ${alreadyPrecachedCount} file${alreadyPrecachedCount === 1 ? " is" : "s are"} already cached.`;
      }
      logger.groupCollapsed(message);
      _nestedGroup(`View newly precached URLs.`, urlsToPrecache);
      _nestedGroup(`View previously precached URLs.`, urlsAlreadyPrecached);
      logger.groupEnd();
    }
  }

  // node_modules/workbox-core/_private/canConstructResponseFromBodyStream.js
  var supportStatus;
  function canConstructResponseFromBodyStream() {
    if (supportStatus === void 0) {
      const testResponse = new Response("");
      if ("body" in testResponse) {
        try {
          new Response(testResponse.body);
          supportStatus = true;
        } catch (error) {
          supportStatus = false;
        }
      }
      supportStatus = false;
    }
    return supportStatus;
  }

  // node_modules/workbox-core/copyResponse.js
  async function copyResponse(response, modifier) {
    let origin = null;
    if (response.url) {
      const responseURL = new URL(response.url);
      origin = responseURL.origin;
    }
    if (origin !== self.location.origin) {
      throw new WorkboxError("cross-origin-copy-response", { origin });
    }
    const clonedResponse = response.clone();
    const responseInit = {
      headers: new Headers(clonedResponse.headers),
      status: clonedResponse.status,
      statusText: clonedResponse.statusText
    };
    const modifiedResponseInit = modifier ? modifier(responseInit) : responseInit;
    const body = canConstructResponseFromBodyStream() ? clonedResponse.body : await clonedResponse.blob();
    return new Response(body, modifiedResponseInit);
  }

  // node_modules/workbox-core/_private/cacheMatchIgnoreParams.js
  function stripParams(fullURL, ignoreParams) {
    const strippedURL = new URL(fullURL);
    for (const param of ignoreParams) {
      strippedURL.searchParams.delete(param);
    }
    return strippedURL.href;
  }
  async function cacheMatchIgnoreParams(cache, request, ignoreParams, matchOptions) {
    const strippedRequestURL = stripParams(request.url, ignoreParams);
    if (request.url === strippedRequestURL) {
      return cache.match(request, matchOptions);
    }
    const keysOptions = Object.assign(Object.assign({}, matchOptions), { ignoreSearch: true });
    const cacheKeys = await cache.keys(request, keysOptions);
    for (const cacheKey of cacheKeys) {
      const strippedCacheKeyURL = stripParams(cacheKey.url, ignoreParams);
      if (strippedRequestURL === strippedCacheKeyURL) {
        return cache.match(cacheKey, matchOptions);
      }
    }
    return;
  }

  // node_modules/workbox-core/_private/Deferred.js
  var Deferred = class {
    /**
     * Creates a promise and exposes its resolve and reject functions as methods.
     */
    constructor() {
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    }
  };

  // node_modules/workbox-core/models/quotaErrorCallbacks.js
  var quotaErrorCallbacks = /* @__PURE__ */ new Set();

  // node_modules/workbox-core/_private/executeQuotaErrorCallbacks.js
  async function executeQuotaErrorCallbacks() {
    if (true) {
      logger.log(`About to run ${quotaErrorCallbacks.size} callbacks to clean up caches.`);
    }
    for (const callback of quotaErrorCallbacks) {
      await callback();
      if (true) {
        logger.log(callback, "is complete.");
      }
    }
    if (true) {
      logger.log("Finished running callbacks.");
    }
  }

  // node_modules/workbox-core/_private/timeout.js
  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // node_modules/workbox-strategies/_version.js
  try {
    self["workbox:strategies:7.0.0"] && _();
  } catch (e) {
  }

  // node_modules/workbox-strategies/StrategyHandler.js
  function toRequest(input) {
    return typeof input === "string" ? new Request(input) : input;
  }
  var StrategyHandler = class {
    /**
     * Creates a new instance associated with the passed strategy and event
     * that's handling the request.
     *
     * The constructor also initializes the state that will be passed to each of
     * the plugins handling this request.
     *
     * @param {workbox-strategies.Strategy} strategy
     * @param {Object} options
     * @param {Request|string} options.request A request to run this strategy for.
     * @param {ExtendableEvent} options.event The event associated with the
     *     request.
     * @param {URL} [options.url]
     * @param {*} [options.params] The return value from the
     *     {@link workbox-routing~matchCallback} (if applicable).
     */
    constructor(strategy, options) {
      this._cacheKeys = {};
      if (true) {
        finalAssertExports.isInstance(options.event, ExtendableEvent, {
          moduleName: "workbox-strategies",
          className: "StrategyHandler",
          funcName: "constructor",
          paramName: "options.event"
        });
      }
      Object.assign(this, options);
      this.event = options.event;
      this._strategy = strategy;
      this._handlerDeferred = new Deferred();
      this._extendLifetimePromises = [];
      this._plugins = [...strategy.plugins];
      this._pluginStateMap = /* @__PURE__ */ new Map();
      for (const plugin of this._plugins) {
        this._pluginStateMap.set(plugin, {});
      }
      this.event.waitUntil(this._handlerDeferred.promise);
    }
    /**
     * Fetches a given request (and invokes any applicable plugin callback
     * methods) using the `fetchOptions` (for non-navigation requests) and
     * `plugins` defined on the `Strategy` object.
     *
     * The following plugin lifecycle methods are invoked when using this method:
     * - `requestWillFetch()`
     * - `fetchDidSucceed()`
     * - `fetchDidFail()`
     *
     * @param {Request|string} input The URL or request to fetch.
     * @return {Promise<Response>}
     */
    async fetch(input) {
      const { event } = this;
      let request = toRequest(input);
      if (request.mode === "navigate" && event instanceof FetchEvent && event.preloadResponse) {
        const possiblePreloadResponse = await event.preloadResponse;
        if (possiblePreloadResponse) {
          if (true) {
            logger.log(`Using a preloaded navigation response for '${getFriendlyURL(request.url)}'`);
          }
          return possiblePreloadResponse;
        }
      }
      const originalRequest = this.hasCallback("fetchDidFail") ? request.clone() : null;
      try {
        for (const cb of this.iterateCallbacks("requestWillFetch")) {
          request = await cb({ request: request.clone(), event });
        }
      } catch (err) {
        if (err instanceof Error) {
          throw new WorkboxError("plugin-error-request-will-fetch", {
            thrownErrorMessage: err.message
          });
        }
      }
      const pluginFilteredRequest = request.clone();
      try {
        let fetchResponse;
        fetchResponse = await fetch(request, request.mode === "navigate" ? void 0 : this._strategy.fetchOptions);
        if (true) {
          logger.debug(`Network request for '${getFriendlyURL(request.url)}' returned a response with status '${fetchResponse.status}'.`);
        }
        for (const callback of this.iterateCallbacks("fetchDidSucceed")) {
          fetchResponse = await callback({
            event,
            request: pluginFilteredRequest,
            response: fetchResponse
          });
        }
        return fetchResponse;
      } catch (error) {
        if (true) {
          logger.log(`Network request for '${getFriendlyURL(request.url)}' threw an error.`, error);
        }
        if (originalRequest) {
          await this.runCallbacks("fetchDidFail", {
            error,
            event,
            originalRequest: originalRequest.clone(),
            request: pluginFilteredRequest.clone()
          });
        }
        throw error;
      }
    }
    /**
     * Calls `this.fetch()` and (in the background) runs `this.cachePut()` on
     * the response generated by `this.fetch()`.
     *
     * The call to `this.cachePut()` automatically invokes `this.waitUntil()`,
     * so you do not have to manually call `waitUntil()` on the event.
     *
     * @param {Request|string} input The request or URL to fetch and cache.
     * @return {Promise<Response>}
     */
    async fetchAndCachePut(input) {
      const response = await this.fetch(input);
      const responseClone = response.clone();
      void this.waitUntil(this.cachePut(input, responseClone));
      return response;
    }
    /**
     * Matches a request from the cache (and invokes any applicable plugin
     * callback methods) using the `cacheName`, `matchOptions`, and `plugins`
     * defined on the strategy object.
     *
     * The following plugin lifecycle methods are invoked when using this method:
     * - cacheKeyWillByUsed()
     * - cachedResponseWillByUsed()
     *
     * @param {Request|string} key The Request or URL to use as the cache key.
     * @return {Promise<Response|undefined>} A matching response, if found.
     */
    async cacheMatch(key) {
      const request = toRequest(key);
      let cachedResponse;
      const { cacheName, matchOptions } = this._strategy;
      const effectiveRequest = await this.getCacheKey(request, "read");
      const multiMatchOptions = Object.assign(Object.assign({}, matchOptions), { cacheName });
      cachedResponse = await caches.match(effectiveRequest, multiMatchOptions);
      if (true) {
        if (cachedResponse) {
          logger.debug(`Found a cached response in '${cacheName}'.`);
        } else {
          logger.debug(`No cached response found in '${cacheName}'.`);
        }
      }
      for (const callback of this.iterateCallbacks("cachedResponseWillBeUsed")) {
        cachedResponse = await callback({
          cacheName,
          matchOptions,
          cachedResponse,
          request: effectiveRequest,
          event: this.event
        }) || void 0;
      }
      return cachedResponse;
    }
    /**
     * Puts a request/response pair in the cache (and invokes any applicable
     * plugin callback methods) using the `cacheName` and `plugins` defined on
     * the strategy object.
     *
     * The following plugin lifecycle methods are invoked when using this method:
     * - cacheKeyWillByUsed()
     * - cacheWillUpdate()
     * - cacheDidUpdate()
     *
     * @param {Request|string} key The request or URL to use as the cache key.
     * @param {Response} response The response to cache.
     * @return {Promise<boolean>} `false` if a cacheWillUpdate caused the response
     * not be cached, and `true` otherwise.
     */
    async cachePut(key, response) {
      const request = toRequest(key);
      await timeout(0);
      const effectiveRequest = await this.getCacheKey(request, "write");
      if (true) {
        if (effectiveRequest.method && effectiveRequest.method !== "GET") {
          throw new WorkboxError("attempt-to-cache-non-get-request", {
            url: getFriendlyURL(effectiveRequest.url),
            method: effectiveRequest.method
          });
        }
        const vary = response.headers.get("Vary");
        if (vary) {
          logger.debug(`The response for ${getFriendlyURL(effectiveRequest.url)} has a 'Vary: ${vary}' header. Consider setting the {ignoreVary: true} option on your strategy to ensure cache matching and deletion works as expected.`);
        }
      }
      if (!response) {
        if (true) {
          logger.error(`Cannot cache non-existent response for '${getFriendlyURL(effectiveRequest.url)}'.`);
        }
        throw new WorkboxError("cache-put-with-no-response", {
          url: getFriendlyURL(effectiveRequest.url)
        });
      }
      const responseToCache = await this._ensureResponseSafeToCache(response);
      if (!responseToCache) {
        if (true) {
          logger.debug(`Response '${getFriendlyURL(effectiveRequest.url)}' will not be cached.`, responseToCache);
        }
        return false;
      }
      const { cacheName, matchOptions } = this._strategy;
      const cache = await self.caches.open(cacheName);
      const hasCacheUpdateCallback = this.hasCallback("cacheDidUpdate");
      const oldResponse = hasCacheUpdateCallback ? await cacheMatchIgnoreParams(
        // TODO(philipwalton): the `__WB_REVISION__` param is a precaching
        // feature. Consider into ways to only add this behavior if using
        // precaching.
        cache,
        effectiveRequest.clone(),
        ["__WB_REVISION__"],
        matchOptions
      ) : null;
      if (true) {
        logger.debug(`Updating the '${cacheName}' cache with a new Response for ${getFriendlyURL(effectiveRequest.url)}.`);
      }
      try {
        await cache.put(effectiveRequest, hasCacheUpdateCallback ? responseToCache.clone() : responseToCache);
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "QuotaExceededError") {
            await executeQuotaErrorCallbacks();
          }
          throw error;
        }
      }
      for (const callback of this.iterateCallbacks("cacheDidUpdate")) {
        await callback({
          cacheName,
          oldResponse,
          newResponse: responseToCache.clone(),
          request: effectiveRequest,
          event: this.event
        });
      }
      return true;
    }
    /**
     * Checks the list of plugins for the `cacheKeyWillBeUsed` callback, and
     * executes any of those callbacks found in sequence. The final `Request`
     * object returned by the last plugin is treated as the cache key for cache
     * reads and/or writes. If no `cacheKeyWillBeUsed` plugin callbacks have
     * been registered, the passed request is returned unmodified
     *
     * @param {Request} request
     * @param {string} mode
     * @return {Promise<Request>}
     */
    async getCacheKey(request, mode) {
      const key = `${request.url} | ${mode}`;
      if (!this._cacheKeys[key]) {
        let effectiveRequest = request;
        for (const callback of this.iterateCallbacks("cacheKeyWillBeUsed")) {
          effectiveRequest = toRequest(await callback({
            mode,
            request: effectiveRequest,
            event: this.event,
            // params has a type any can't change right now.
            params: this.params
            // eslint-disable-line
          }));
        }
        this._cacheKeys[key] = effectiveRequest;
      }
      return this._cacheKeys[key];
    }
    /**
     * Returns true if the strategy has at least one plugin with the given
     * callback.
     *
     * @param {string} name The name of the callback to check for.
     * @return {boolean}
     */
    hasCallback(name) {
      for (const plugin of this._strategy.plugins) {
        if (name in plugin) {
          return true;
        }
      }
      return false;
    }
    /**
     * Runs all plugin callbacks matching the given name, in order, passing the
     * given param object (merged ith the current plugin state) as the only
     * argument.
     *
     * Note: since this method runs all plugins, it's not suitable for cases
     * where the return value of a callback needs to be applied prior to calling
     * the next callback. See
     * {@link workbox-strategies.StrategyHandler#iterateCallbacks}
     * below for how to handle that case.
     *
     * @param {string} name The name of the callback to run within each plugin.
     * @param {Object} param The object to pass as the first (and only) param
     *     when executing each callback. This object will be merged with the
     *     current plugin state prior to callback execution.
     */
    async runCallbacks(name, param) {
      for (const callback of this.iterateCallbacks(name)) {
        await callback(param);
      }
    }
    /**
     * Accepts a callback and returns an iterable of matching plugin callbacks,
     * where each callback is wrapped with the current handler state (i.e. when
     * you call each callback, whatever object parameter you pass it will
     * be merged with the plugin's current state).
     *
     * @param {string} name The name fo the callback to run
     * @return {Array<Function>}
     */
    *iterateCallbacks(name) {
      for (const plugin of this._strategy.plugins) {
        if (typeof plugin[name] === "function") {
          const state = this._pluginStateMap.get(plugin);
          const statefulCallback = (param) => {
            const statefulParam = Object.assign(Object.assign({}, param), { state });
            return plugin[name](statefulParam);
          };
          yield statefulCallback;
        }
      }
    }
    /**
     * Adds a promise to the
     * [extend lifetime promises]{@link https://w3c.github.io/ServiceWorker/#extendableevent-extend-lifetime-promises}
     * of the event event associated with the request being handled (usually a
     * `FetchEvent`).
     *
     * Note: you can await
     * {@link workbox-strategies.StrategyHandler~doneWaiting}
     * to know when all added promises have settled.
     *
     * @param {Promise} promise A promise to add to the extend lifetime promises
     *     of the event that triggered the request.
     */
    waitUntil(promise) {
      this._extendLifetimePromises.push(promise);
      return promise;
    }
    /**
     * Returns a promise that resolves once all promises passed to
     * {@link workbox-strategies.StrategyHandler~waitUntil}
     * have settled.
     *
     * Note: any work done after `doneWaiting()` settles should be manually
     * passed to an event's `waitUntil()` method (not this handler's
     * `waitUntil()` method), otherwise the service worker thread my be killed
     * prior to your work completing.
     */
    async doneWaiting() {
      let promise;
      while (promise = this._extendLifetimePromises.shift()) {
        await promise;
      }
    }
    /**
     * Stops running the strategy and immediately resolves any pending
     * `waitUntil()` promises.
     */
    destroy() {
      this._handlerDeferred.resolve(null);
    }
    /**
     * This method will call cacheWillUpdate on the available plugins (or use
     * status === 200) to determine if the Response is safe and valid to cache.
     *
     * @param {Request} options.request
     * @param {Response} options.response
     * @return {Promise<Response|undefined>}
     *
     * @private
     */
    async _ensureResponseSafeToCache(response) {
      let responseToCache = response;
      let pluginsUsed = false;
      for (const callback of this.iterateCallbacks("cacheWillUpdate")) {
        responseToCache = await callback({
          request: this.request,
          response: responseToCache,
          event: this.event
        }) || void 0;
        pluginsUsed = true;
        if (!responseToCache) {
          break;
        }
      }
      if (!pluginsUsed) {
        if (responseToCache && responseToCache.status !== 200) {
          responseToCache = void 0;
        }
        if (true) {
          if (responseToCache) {
            if (responseToCache.status !== 200) {
              if (responseToCache.status === 0) {
                logger.warn(`The response for '${this.request.url}' is an opaque response. The caching strategy that you're using will not cache opaque responses by default.`);
              } else {
                logger.debug(`The response for '${this.request.url}' returned a status code of '${response.status}' and won't be cached as a result.`);
              }
            }
          }
        }
      }
      return responseToCache;
    }
  };

  // node_modules/workbox-strategies/Strategy.js
  var Strategy = class {
    /**
     * Creates a new instance of the strategy and sets all documented option
     * properties as public instance properties.
     *
     * Note: if a custom strategy class extends the base Strategy class and does
     * not need more than these properties, it does not need to define its own
     * constructor.
     *
     * @param {Object} [options]
     * @param {string} [options.cacheName] Cache name to store and retrieve
     * requests. Defaults to the cache names provided by
     * {@link workbox-core.cacheNames}.
     * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
     * to use in conjunction with this caching strategy.
     * @param {Object} [options.fetchOptions] Values passed along to the
     * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
     * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
     * `fetch()` requests made by this strategy.
     * @param {Object} [options.matchOptions] The
     * [`CacheQueryOptions`]{@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions}
     * for any `cache.match()` or `cache.put()` calls made by this strategy.
     */
    constructor(options = {}) {
      this.cacheName = cacheNames.getRuntimeName(options.cacheName);
      this.plugins = options.plugins || [];
      this.fetchOptions = options.fetchOptions;
      this.matchOptions = options.matchOptions;
    }
    /**
     * Perform a request strategy and returns a `Promise` that will resolve with
     * a `Response`, invoking all relevant plugin callbacks.
     *
     * When a strategy instance is registered with a Workbox
     * {@link workbox-routing.Route}, this method is automatically
     * called when the route matches.
     *
     * Alternatively, this method can be used in a standalone `FetchEvent`
     * listener by passing it to `event.respondWith()`.
     *
     * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
     *     properties listed below.
     * @param {Request|string} options.request A request to run this strategy for.
     * @param {ExtendableEvent} options.event The event associated with the
     *     request.
     * @param {URL} [options.url]
     * @param {*} [options.params]
     */
    handle(options) {
      const [responseDone] = this.handleAll(options);
      return responseDone;
    }
    /**
     * Similar to {@link workbox-strategies.Strategy~handle}, but
     * instead of just returning a `Promise` that resolves to a `Response` it
     * it will return an tuple of `[response, done]` promises, where the former
     * (`response`) is equivalent to what `handle()` returns, and the latter is a
     * Promise that will resolve once any promises that were added to
     * `event.waitUntil()` as part of performing the strategy have completed.
     *
     * You can await the `done` promise to ensure any extra work performed by
     * the strategy (usually caching responses) completes successfully.
     *
     * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
     *     properties listed below.
     * @param {Request|string} options.request A request to run this strategy for.
     * @param {ExtendableEvent} options.event The event associated with the
     *     request.
     * @param {URL} [options.url]
     * @param {*} [options.params]
     * @return {Array<Promise>} A tuple of [response, done]
     *     promises that can be used to determine when the response resolves as
     *     well as when the handler has completed all its work.
     */
    handleAll(options) {
      if (options instanceof FetchEvent) {
        options = {
          event: options,
          request: options.request
        };
      }
      const event = options.event;
      const request = typeof options.request === "string" ? new Request(options.request) : options.request;
      const params = "params" in options ? options.params : void 0;
      const handler = new StrategyHandler(this, { event, request, params });
      const responseDone = this._getResponse(handler, request, event);
      const handlerDone = this._awaitComplete(responseDone, handler, request, event);
      return [responseDone, handlerDone];
    }
    async _getResponse(handler, request, event) {
      await handler.runCallbacks("handlerWillStart", { event, request });
      let response = void 0;
      try {
        response = await this._handle(request, handler);
        if (!response || response.type === "error") {
          throw new WorkboxError("no-response", { url: request.url });
        }
      } catch (error) {
        if (error instanceof Error) {
          for (const callback of handler.iterateCallbacks("handlerDidError")) {
            response = await callback({ error, event, request });
            if (response) {
              break;
            }
          }
        }
        if (!response) {
          throw error;
        } else if (true) {
          logger.log(`While responding to '${getFriendlyURL(request.url)}', an ${error instanceof Error ? error.toString() : ""} error occurred. Using a fallback response provided by a handlerDidError plugin.`);
        }
      }
      for (const callback of handler.iterateCallbacks("handlerWillRespond")) {
        response = await callback({ event, request, response });
      }
      return response;
    }
    async _awaitComplete(responseDone, handler, request, event) {
      let response;
      let error;
      try {
        response = await responseDone;
      } catch (error2) {
      }
      try {
        await handler.runCallbacks("handlerDidRespond", {
          event,
          request,
          response
        });
        await handler.doneWaiting();
      } catch (waitUntilError) {
        if (waitUntilError instanceof Error) {
          error = waitUntilError;
        }
      }
      await handler.runCallbacks("handlerDidComplete", {
        event,
        request,
        response,
        error
      });
      handler.destroy();
      if (error) {
        throw error;
      }
    }
  };

  // node_modules/workbox-precaching/PrecacheStrategy.js
  var PrecacheStrategy = class _PrecacheStrategy extends Strategy {
    /**
     *
     * @param {Object} [options]
     * @param {string} [options.cacheName] Cache name to store and retrieve
     * requests. Defaults to the cache names provided by
     * {@link workbox-core.cacheNames}.
     * @param {Array<Object>} [options.plugins] {@link https://developers.google.com/web/tools/workbox/guides/using-plugins|Plugins}
     * to use in conjunction with this caching strategy.
     * @param {Object} [options.fetchOptions] Values passed along to the
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters|init}
     * of all fetch() requests made by this strategy.
     * @param {Object} [options.matchOptions] The
     * {@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions|CacheQueryOptions}
     * for any `cache.match()` or `cache.put()` calls made by this strategy.
     * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
     * get the response from the network if there's a precache miss.
     */
    constructor(options = {}) {
      options.cacheName = cacheNames.getPrecacheName(options.cacheName);
      super(options);
      this._fallbackToNetwork = options.fallbackToNetwork === false ? false : true;
      this.plugins.push(_PrecacheStrategy.copyRedirectedCacheableResponsesPlugin);
    }
    /**
     * @private
     * @param {Request|string} request A request to run this strategy for.
     * @param {workbox-strategies.StrategyHandler} handler The event that
     *     triggered the request.
     * @return {Promise<Response>}
     */
    async _handle(request, handler) {
      const response = await handler.cacheMatch(request);
      if (response) {
        return response;
      }
      if (handler.event && handler.event.type === "install") {
        return await this._handleInstall(request, handler);
      }
      return await this._handleFetch(request, handler);
    }
    async _handleFetch(request, handler) {
      let response;
      const params = handler.params || {};
      if (this._fallbackToNetwork) {
        if (true) {
          logger.warn(`The precached response for ${getFriendlyURL(request.url)} in ${this.cacheName} was not found. Falling back to the network.`);
        }
        const integrityInManifest = params.integrity;
        const integrityInRequest = request.integrity;
        const noIntegrityConflict = !integrityInRequest || integrityInRequest === integrityInManifest;
        response = await handler.fetch(new Request(request, {
          integrity: request.mode !== "no-cors" ? integrityInRequest || integrityInManifest : void 0
        }));
        if (integrityInManifest && noIntegrityConflict && request.mode !== "no-cors") {
          this._useDefaultCacheabilityPluginIfNeeded();
          const wasCached = await handler.cachePut(request, response.clone());
          if (true) {
            if (wasCached) {
              logger.log(`A response for ${getFriendlyURL(request.url)} was used to "repair" the precache.`);
            }
          }
        }
      } else {
        throw new WorkboxError("missing-precache-entry", {
          cacheName: this.cacheName,
          url: request.url
        });
      }
      if (true) {
        const cacheKey = params.cacheKey || await handler.getCacheKey(request, "read");
        logger.groupCollapsed(`Precaching is responding to: ` + getFriendlyURL(request.url));
        logger.log(`Serving the precached url: ${getFriendlyURL(cacheKey instanceof Request ? cacheKey.url : cacheKey)}`);
        logger.groupCollapsed(`View request details here.`);
        logger.log(request);
        logger.groupEnd();
        logger.groupCollapsed(`View response details here.`);
        logger.log(response);
        logger.groupEnd();
        logger.groupEnd();
      }
      return response;
    }
    async _handleInstall(request, handler) {
      this._useDefaultCacheabilityPluginIfNeeded();
      const response = await handler.fetch(request);
      const wasCached = await handler.cachePut(request, response.clone());
      if (!wasCached) {
        throw new WorkboxError("bad-precaching-response", {
          url: request.url,
          status: response.status
        });
      }
      return response;
    }
    /**
     * This method is complex, as there a number of things to account for:
     *
     * The `plugins` array can be set at construction, and/or it might be added to
     * to at any time before the strategy is used.
     *
     * At the time the strategy is used (i.e. during an `install` event), there
     * needs to be at least one plugin that implements `cacheWillUpdate` in the
     * array, other than `copyRedirectedCacheableResponsesPlugin`.
     *
     * - If this method is called and there are no suitable `cacheWillUpdate`
     * plugins, we need to add `defaultPrecacheCacheabilityPlugin`.
     *
     * - If this method is called and there is exactly one `cacheWillUpdate`, then
     * we don't have to do anything (this might be a previously added
     * `defaultPrecacheCacheabilityPlugin`, or it might be a custom plugin).
     *
     * - If this method is called and there is more than one `cacheWillUpdate`,
     * then we need to check if one is `defaultPrecacheCacheabilityPlugin`. If so,
     * we need to remove it. (This situation is unlikely, but it could happen if
     * the strategy is used multiple times, the first without a `cacheWillUpdate`,
     * and then later on after manually adding a custom `cacheWillUpdate`.)
     *
     * See https://github.com/GoogleChrome/workbox/issues/2737 for more context.
     *
     * @private
     */
    _useDefaultCacheabilityPluginIfNeeded() {
      let defaultPluginIndex = null;
      let cacheWillUpdatePluginCount = 0;
      for (const [index, plugin] of this.plugins.entries()) {
        if (plugin === _PrecacheStrategy.copyRedirectedCacheableResponsesPlugin) {
          continue;
        }
        if (plugin === _PrecacheStrategy.defaultPrecacheCacheabilityPlugin) {
          defaultPluginIndex = index;
        }
        if (plugin.cacheWillUpdate) {
          cacheWillUpdatePluginCount++;
        }
      }
      if (cacheWillUpdatePluginCount === 0) {
        this.plugins.push(_PrecacheStrategy.defaultPrecacheCacheabilityPlugin);
      } else if (cacheWillUpdatePluginCount > 1 && defaultPluginIndex !== null) {
        this.plugins.splice(defaultPluginIndex, 1);
      }
    }
  };
  PrecacheStrategy.defaultPrecacheCacheabilityPlugin = {
    async cacheWillUpdate({ response }) {
      if (!response || response.status >= 400) {
        return null;
      }
      return response;
    }
  };
  PrecacheStrategy.copyRedirectedCacheableResponsesPlugin = {
    async cacheWillUpdate({ response }) {
      return response.redirected ? await copyResponse(response) : response;
    }
  };

  // node_modules/workbox-precaching/PrecacheController.js
  var PrecacheController = class {
    /**
     * Create a new PrecacheController.
     *
     * @param {Object} [options]
     * @param {string} [options.cacheName] The cache to use for precaching.
     * @param {string} [options.plugins] Plugins to use when precaching as well
     * as responding to fetch events for precached assets.
     * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
     * get the response from the network if there's a precache miss.
     */
    constructor({ cacheName, plugins = [], fallbackToNetwork = true } = {}) {
      this._urlsToCacheKeys = /* @__PURE__ */ new Map();
      this._urlsToCacheModes = /* @__PURE__ */ new Map();
      this._cacheKeysToIntegrities = /* @__PURE__ */ new Map();
      this._strategy = new PrecacheStrategy({
        cacheName: cacheNames.getPrecacheName(cacheName),
        plugins: [
          ...plugins,
          new PrecacheCacheKeyPlugin({ precacheController: this })
        ],
        fallbackToNetwork
      });
      this.install = this.install.bind(this);
      this.activate = this.activate.bind(this);
    }
    /**
     * @type {workbox-precaching.PrecacheStrategy} The strategy created by this controller and
     * used to cache assets and respond to fetch events.
     */
    get strategy() {
      return this._strategy;
    }
    /**
     * Adds items to the precache list, removing any duplicates and
     * stores the files in the
     * {@link workbox-core.cacheNames|"precache cache"} when the service
     * worker installs.
     *
     * This method can be called multiple times.
     *
     * @param {Array<Object|string>} [entries=[]] Array of entries to precache.
     */
    precache(entries) {
      this.addToCacheList(entries);
      if (!this._installAndActiveListenersAdded) {
        self.addEventListener("install", this.install);
        self.addEventListener("activate", this.activate);
        this._installAndActiveListenersAdded = true;
      }
    }
    /**
     * This method will add items to the precache list, removing duplicates
     * and ensuring the information is valid.
     *
     * @param {Array<workbox-precaching.PrecacheController.PrecacheEntry|string>} entries
     *     Array of entries to precache.
     */
    addToCacheList(entries) {
      if (true) {
        finalAssertExports.isArray(entries, {
          moduleName: "workbox-precaching",
          className: "PrecacheController",
          funcName: "addToCacheList",
          paramName: "entries"
        });
      }
      const urlsToWarnAbout = [];
      for (const entry of entries) {
        if (typeof entry === "string") {
          urlsToWarnAbout.push(entry);
        } else if (entry && entry.revision === void 0) {
          urlsToWarnAbout.push(entry.url);
        }
        const { cacheKey, url } = createCacheKey(entry);
        const cacheMode = typeof entry !== "string" && entry.revision ? "reload" : "default";
        if (this._urlsToCacheKeys.has(url) && this._urlsToCacheKeys.get(url) !== cacheKey) {
          throw new WorkboxError("add-to-cache-list-conflicting-entries", {
            firstEntry: this._urlsToCacheKeys.get(url),
            secondEntry: cacheKey
          });
        }
        if (typeof entry !== "string" && entry.integrity) {
          if (this._cacheKeysToIntegrities.has(cacheKey) && this._cacheKeysToIntegrities.get(cacheKey) !== entry.integrity) {
            throw new WorkboxError("add-to-cache-list-conflicting-integrities", {
              url
            });
          }
          this._cacheKeysToIntegrities.set(cacheKey, entry.integrity);
        }
        this._urlsToCacheKeys.set(url, cacheKey);
        this._urlsToCacheModes.set(url, cacheMode);
        if (urlsToWarnAbout.length > 0) {
          const warningMessage = `Workbox is precaching URLs without revision info: ${urlsToWarnAbout.join(", ")}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`;
          if (false) {
            console.warn(warningMessage);
          } else {
            logger.warn(warningMessage);
          }
        }
      }
    }
    /**
     * Precaches new and updated assets. Call this method from the service worker
     * install event.
     *
     * Note: this method calls `event.waitUntil()` for you, so you do not need
     * to call it yourself in your event handlers.
     *
     * @param {ExtendableEvent} event
     * @return {Promise<workbox-precaching.InstallResult>}
     */
    install(event) {
      return waitUntil(event, async () => {
        const installReportPlugin = new PrecacheInstallReportPlugin();
        this.strategy.plugins.push(installReportPlugin);
        for (const [url, cacheKey] of this._urlsToCacheKeys) {
          const integrity = this._cacheKeysToIntegrities.get(cacheKey);
          const cacheMode = this._urlsToCacheModes.get(url);
          const request = new Request(url, {
            integrity,
            cache: cacheMode,
            credentials: "same-origin"
          });
          await Promise.all(this.strategy.handleAll({
            params: { cacheKey },
            request,
            event
          }));
        }
        const { updatedURLs, notUpdatedURLs } = installReportPlugin;
        if (true) {
          printInstallDetails(updatedURLs, notUpdatedURLs);
        }
        return { updatedURLs, notUpdatedURLs };
      });
    }
    /**
     * Deletes assets that are no longer present in the current precache manifest.
     * Call this method from the service worker activate event.
     *
     * Note: this method calls `event.waitUntil()` for you, so you do not need
     * to call it yourself in your event handlers.
     *
     * @param {ExtendableEvent} event
     * @return {Promise<workbox-precaching.CleanupResult>}
     */
    activate(event) {
      return waitUntil(event, async () => {
        const cache = await self.caches.open(this.strategy.cacheName);
        const currentlyCachedRequests = await cache.keys();
        const expectedCacheKeys = new Set(this._urlsToCacheKeys.values());
        const deletedURLs = [];
        for (const request of currentlyCachedRequests) {
          if (!expectedCacheKeys.has(request.url)) {
            await cache.delete(request);
            deletedURLs.push(request.url);
          }
        }
        if (true) {
          printCleanupDetails(deletedURLs);
        }
        return { deletedURLs };
      });
    }
    /**
     * Returns a mapping of a precached URL to the corresponding cache key, taking
     * into account the revision information for the URL.
     *
     * @return {Map<string, string>} A URL to cache key mapping.
     */
    getURLsToCacheKeys() {
      return this._urlsToCacheKeys;
    }
    /**
     * Returns a list of all the URLs that have been precached by the current
     * service worker.
     *
     * @return {Array<string>} The precached URLs.
     */
    getCachedURLs() {
      return [...this._urlsToCacheKeys.keys()];
    }
    /**
     * Returns the cache key used for storing a given URL. If that URL is
     * unversioned, like `/index.html', then the cache key will be the original
     * URL with a search parameter appended to it.
     *
     * @param {string} url A URL whose cache key you want to look up.
     * @return {string} The versioned URL that corresponds to a cache key
     * for the original URL, or undefined if that URL isn't precached.
     */
    getCacheKeyForURL(url) {
      const urlObject = new URL(url, location.href);
      return this._urlsToCacheKeys.get(urlObject.href);
    }
    /**
     * @param {string} url A cache key whose SRI you want to look up.
     * @return {string} The subresource integrity associated with the cache key,
     * or undefined if it's not set.
     */
    getIntegrityForCacheKey(cacheKey) {
      return this._cacheKeysToIntegrities.get(cacheKey);
    }
    /**
     * This acts as a drop-in replacement for
     * [`cache.match()`](https://developer.mozilla.org/en-US/docs/Web/API/Cache/match)
     * with the following differences:
     *
     * - It knows what the name of the precache is, and only checks in that cache.
     * - It allows you to pass in an "original" URL without versioning parameters,
     * and it will automatically look up the correct cache key for the currently
     * active revision of that URL.
     *
     * E.g., `matchPrecache('index.html')` will find the correct precached
     * response for the currently active service worker, even if the actual cache
     * key is `'/index.html?__WB_REVISION__=1234abcd'`.
     *
     * @param {string|Request} request The key (without revisioning parameters)
     * to look up in the precache.
     * @return {Promise<Response|undefined>}
     */
    async matchPrecache(request) {
      const url = request instanceof Request ? request.url : request;
      const cacheKey = this.getCacheKeyForURL(url);
      if (cacheKey) {
        const cache = await self.caches.open(this.strategy.cacheName);
        return cache.match(cacheKey);
      }
      return void 0;
    }
    /**
     * Returns a function that looks up `url` in the precache (taking into
     * account revision information), and returns the corresponding `Response`.
     *
     * @param {string} url The precached URL which will be used to lookup the
     * `Response`.
     * @return {workbox-routing~handlerCallback}
     */
    createHandlerBoundToURL(url) {
      const cacheKey = this.getCacheKeyForURL(url);
      if (!cacheKey) {
        throw new WorkboxError("non-precached-url", { url });
      }
      return (options) => {
        options.request = new Request(url);
        options.params = Object.assign({ cacheKey }, options.params);
        return this.strategy.handle(options);
      };
    }
  };

  // node_modules/workbox-precaching/utils/getOrCreatePrecacheController.js
  var precacheController;
  var getOrCreatePrecacheController = () => {
    if (!precacheController) {
      precacheController = new PrecacheController();
    }
    return precacheController;
  };

  // node_modules/workbox-routing/_version.js
  try {
    self["workbox:routing:7.0.0"] && _();
  } catch (e) {
  }

  // node_modules/workbox-routing/utils/constants.js
  var defaultMethod = "GET";
  var validMethods = [
    "DELETE",
    "GET",
    "HEAD",
    "PATCH",
    "POST",
    "PUT"
  ];

  // node_modules/workbox-routing/utils/normalizeHandler.js
  var normalizeHandler = (handler) => {
    if (handler && typeof handler === "object") {
      if (true) {
        finalAssertExports.hasMethod(handler, "handle", {
          moduleName: "workbox-routing",
          className: "Route",
          funcName: "constructor",
          paramName: "handler"
        });
      }
      return handler;
    } else {
      if (true) {
        finalAssertExports.isType(handler, "function", {
          moduleName: "workbox-routing",
          className: "Route",
          funcName: "constructor",
          paramName: "handler"
        });
      }
      return { handle: handler };
    }
  };

  // node_modules/workbox-routing/Route.js
  var Route = class {
    /**
     * Constructor for Route class.
     *
     * @param {workbox-routing~matchCallback} match
     * A callback function that determines whether the route matches a given
     * `fetch` event by returning a non-falsy value.
     * @param {workbox-routing~handlerCallback} handler A callback
     * function that returns a Promise resolving to a Response.
     * @param {string} [method='GET'] The HTTP method to match the Route
     * against.
     */
    constructor(match, handler, method = defaultMethod) {
      if (true) {
        finalAssertExports.isType(match, "function", {
          moduleName: "workbox-routing",
          className: "Route",
          funcName: "constructor",
          paramName: "match"
        });
        if (method) {
          finalAssertExports.isOneOf(method, validMethods, { paramName: "method" });
        }
      }
      this.handler = normalizeHandler(handler);
      this.match = match;
      this.method = method;
    }
    /**
     *
     * @param {workbox-routing-handlerCallback} handler A callback
     * function that returns a Promise resolving to a Response
     */
    setCatchHandler(handler) {
      this.catchHandler = normalizeHandler(handler);
    }
  };

  // node_modules/workbox-routing/RegExpRoute.js
  var RegExpRoute = class extends Route {
    /**
     * If the regular expression contains
     * [capture groups]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#grouping-back-references},
     * the captured values will be passed to the
     * {@link workbox-routing~handlerCallback} `params`
     * argument.
     *
     * @param {RegExp} regExp The regular expression to match against URLs.
     * @param {workbox-routing~handlerCallback} handler A callback
     * function that returns a Promise resulting in a Response.
     * @param {string} [method='GET'] The HTTP method to match the Route
     * against.
     */
    constructor(regExp, handler, method) {
      if (true) {
        finalAssertExports.isInstance(regExp, RegExp, {
          moduleName: "workbox-routing",
          className: "RegExpRoute",
          funcName: "constructor",
          paramName: "pattern"
        });
      }
      const match = ({ url }) => {
        const result = regExp.exec(url.href);
        if (!result) {
          return;
        }
        if (url.origin !== location.origin && result.index !== 0) {
          if (true) {
            logger.debug(`The regular expression '${regExp.toString()}' only partially matched against the cross-origin URL '${url.toString()}'. RegExpRoute's will only handle cross-origin requests if they match the entire URL.`);
          }
          return;
        }
        return result.slice(1);
      };
      super(match, handler, method);
    }
  };

  // node_modules/workbox-routing/Router.js
  var Router = class {
    /**
     * Initializes a new Router.
     */
    constructor() {
      this._routes = /* @__PURE__ */ new Map();
      this._defaultHandlerMap = /* @__PURE__ */ new Map();
    }
    /**
     * @return {Map<string, Array<workbox-routing.Route>>} routes A `Map` of HTTP
     * method name ('GET', etc.) to an array of all the corresponding `Route`
     * instances that are registered.
     */
    get routes() {
      return this._routes;
    }
    /**
     * Adds a fetch event listener to respond to events when a route matches
     * the event's request.
     */
    addFetchListener() {
      self.addEventListener("fetch", (event) => {
        const { request } = event;
        const responsePromise = this.handleRequest({ request, event });
        if (responsePromise) {
          event.respondWith(responsePromise);
        }
      });
    }
    /**
     * Adds a message event listener for URLs to cache from the window.
     * This is useful to cache resources loaded on the page prior to when the
     * service worker started controlling it.
     *
     * The format of the message data sent from the window should be as follows.
     * Where the `urlsToCache` array may consist of URL strings or an array of
     * URL string + `requestInit` object (the same as you'd pass to `fetch()`).
     *
     * ```
     * {
     *   type: 'CACHE_URLS',
     *   payload: {
     *     urlsToCache: [
     *       './script1.js',
     *       './script2.js',
     *       ['./script3.js', {mode: 'no-cors'}],
     *     ],
     *   },
     * }
     * ```
     */
    addCacheListener() {
      self.addEventListener("message", (event) => {
        if (event.data && event.data.type === "CACHE_URLS") {
          const { payload } = event.data;
          if (true) {
            logger.debug(`Caching URLs from the window`, payload.urlsToCache);
          }
          const requestPromises = Promise.all(payload.urlsToCache.map((entry) => {
            if (typeof entry === "string") {
              entry = [entry];
            }
            const request = new Request(...entry);
            return this.handleRequest({ request, event });
          }));
          event.waitUntil(requestPromises);
          if (event.ports && event.ports[0]) {
            void requestPromises.then(() => event.ports[0].postMessage(true));
          }
        }
      });
    }
    /**
     * Apply the routing rules to a FetchEvent object to get a Response from an
     * appropriate Route's handler.
     *
     * @param {Object} options
     * @param {Request} options.request The request to handle.
     * @param {ExtendableEvent} options.event The event that triggered the
     *     request.
     * @return {Promise<Response>|undefined} A promise is returned if a
     *     registered route can handle the request. If there is no matching
     *     route and there's no `defaultHandler`, `undefined` is returned.
     */
    handleRequest({ request, event }) {
      if (true) {
        finalAssertExports.isInstance(request, Request, {
          moduleName: "workbox-routing",
          className: "Router",
          funcName: "handleRequest",
          paramName: "options.request"
        });
      }
      const url = new URL(request.url, location.href);
      if (!url.protocol.startsWith("http")) {
        if (true) {
          logger.debug(`Workbox Router only supports URLs that start with 'http'.`);
        }
        return;
      }
      const sameOrigin = url.origin === location.origin;
      const { params, route } = this.findMatchingRoute({
        event,
        request,
        sameOrigin,
        url
      });
      let handler = route && route.handler;
      const debugMessages = [];
      if (true) {
        if (handler) {
          debugMessages.push([`Found a route to handle this request:`, route]);
          if (params) {
            debugMessages.push([
              `Passing the following params to the route's handler:`,
              params
            ]);
          }
        }
      }
      const method = request.method;
      if (!handler && this._defaultHandlerMap.has(method)) {
        if (true) {
          debugMessages.push(`Failed to find a matching route. Falling back to the default handler for ${method}.`);
        }
        handler = this._defaultHandlerMap.get(method);
      }
      if (!handler) {
        if (true) {
          logger.debug(`No route found for: ${getFriendlyURL(url)}`);
        }
        return;
      }
      if (true) {
        logger.groupCollapsed(`Router is responding to: ${getFriendlyURL(url)}`);
        debugMessages.forEach((msg) => {
          if (Array.isArray(msg)) {
            logger.log(...msg);
          } else {
            logger.log(msg);
          }
        });
        logger.groupEnd();
      }
      let responsePromise;
      try {
        responsePromise = handler.handle({ url, request, event, params });
      } catch (err) {
        responsePromise = Promise.reject(err);
      }
      const catchHandler = route && route.catchHandler;
      if (responsePromise instanceof Promise && (this._catchHandler || catchHandler)) {
        responsePromise = responsePromise.catch(async (err) => {
          if (catchHandler) {
            if (true) {
              logger.groupCollapsed(`Error thrown when responding to:  ${getFriendlyURL(url)}. Falling back to route's Catch Handler.`);
              logger.error(`Error thrown by:`, route);
              logger.error(err);
              logger.groupEnd();
            }
            try {
              return await catchHandler.handle({ url, request, event, params });
            } catch (catchErr) {
              if (catchErr instanceof Error) {
                err = catchErr;
              }
            }
          }
          if (this._catchHandler) {
            if (true) {
              logger.groupCollapsed(`Error thrown when responding to:  ${getFriendlyURL(url)}. Falling back to global Catch Handler.`);
              logger.error(`Error thrown by:`, route);
              logger.error(err);
              logger.groupEnd();
            }
            return this._catchHandler.handle({ url, request, event });
          }
          throw err;
        });
      }
      return responsePromise;
    }
    /**
     * Checks a request and URL (and optionally an event) against the list of
     * registered routes, and if there's a match, returns the corresponding
     * route along with any params generated by the match.
     *
     * @param {Object} options
     * @param {URL} options.url
     * @param {boolean} options.sameOrigin The result of comparing `url.origin`
     *     against the current origin.
     * @param {Request} options.request The request to match.
     * @param {Event} options.event The corresponding event.
     * @return {Object} An object with `route` and `params` properties.
     *     They are populated if a matching route was found or `undefined`
     *     otherwise.
     */
    findMatchingRoute({ url, sameOrigin, request, event }) {
      const routes = this._routes.get(request.method) || [];
      for (const route of routes) {
        let params;
        const matchResult = route.match({ url, sameOrigin, request, event });
        if (matchResult) {
          if (true) {
            if (matchResult instanceof Promise) {
              logger.warn(`While routing ${getFriendlyURL(url)}, an async matchCallback function was used. Please convert the following route to use a synchronous matchCallback function:`, route);
            }
          }
          params = matchResult;
          if (Array.isArray(params) && params.length === 0) {
            params = void 0;
          } else if (matchResult.constructor === Object && // eslint-disable-line
          Object.keys(matchResult).length === 0) {
            params = void 0;
          } else if (typeof matchResult === "boolean") {
            params = void 0;
          }
          return { route, params };
        }
      }
      return {};
    }
    /**
     * Define a default `handler` that's called when no routes explicitly
     * match the incoming request.
     *
     * Each HTTP method ('GET', 'POST', etc.) gets its own default handler.
     *
     * Without a default handler, unmatched requests will go against the
     * network as if there were no service worker present.
     *
     * @param {workbox-routing~handlerCallback} handler A callback
     * function that returns a Promise resulting in a Response.
     * @param {string} [method='GET'] The HTTP method to associate with this
     * default handler. Each method has its own default.
     */
    setDefaultHandler(handler, method = defaultMethod) {
      this._defaultHandlerMap.set(method, normalizeHandler(handler));
    }
    /**
     * If a Route throws an error while handling a request, this `handler`
     * will be called and given a chance to provide a response.
     *
     * @param {workbox-routing~handlerCallback} handler A callback
     * function that returns a Promise resulting in a Response.
     */
    setCatchHandler(handler) {
      this._catchHandler = normalizeHandler(handler);
    }
    /**
     * Registers a route with the router.
     *
     * @param {workbox-routing.Route} route The route to register.
     */
    registerRoute(route) {
      if (true) {
        finalAssertExports.isType(route, "object", {
          moduleName: "workbox-routing",
          className: "Router",
          funcName: "registerRoute",
          paramName: "route"
        });
        finalAssertExports.hasMethod(route, "match", {
          moduleName: "workbox-routing",
          className: "Router",
          funcName: "registerRoute",
          paramName: "route"
        });
        finalAssertExports.isType(route.handler, "object", {
          moduleName: "workbox-routing",
          className: "Router",
          funcName: "registerRoute",
          paramName: "route"
        });
        finalAssertExports.hasMethod(route.handler, "handle", {
          moduleName: "workbox-routing",
          className: "Router",
          funcName: "registerRoute",
          paramName: "route.handler"
        });
        finalAssertExports.isType(route.method, "string", {
          moduleName: "workbox-routing",
          className: "Router",
          funcName: "registerRoute",
          paramName: "route.method"
        });
      }
      if (!this._routes.has(route.method)) {
        this._routes.set(route.method, []);
      }
      this._routes.get(route.method).push(route);
    }
    /**
     * Unregisters a route with the router.
     *
     * @param {workbox-routing.Route} route The route to unregister.
     */
    unregisterRoute(route) {
      if (!this._routes.has(route.method)) {
        throw new WorkboxError("unregister-route-but-not-found-with-method", {
          method: route.method
        });
      }
      const routeIndex = this._routes.get(route.method).indexOf(route);
      if (routeIndex > -1) {
        this._routes.get(route.method).splice(routeIndex, 1);
      } else {
        throw new WorkboxError("unregister-route-route-not-registered");
      }
    }
  };

  // node_modules/workbox-routing/utils/getOrCreateDefaultRouter.js
  var defaultRouter;
  var getOrCreateDefaultRouter = () => {
    if (!defaultRouter) {
      defaultRouter = new Router();
      defaultRouter.addFetchListener();
      defaultRouter.addCacheListener();
    }
    return defaultRouter;
  };

  // node_modules/workbox-routing/registerRoute.js
  function registerRoute(capture, handler, method) {
    let route;
    if (typeof capture === "string") {
      const captureUrl = new URL(capture, location.href);
      if (true) {
        if (!(capture.startsWith("/") || capture.startsWith("http"))) {
          throw new WorkboxError("invalid-string", {
            moduleName: "workbox-routing",
            funcName: "registerRoute",
            paramName: "capture"
          });
        }
        const valueToCheck = capture.startsWith("http") ? captureUrl.pathname : capture;
        const wildcards = "[*:?+]";
        if (new RegExp(`${wildcards}`).exec(valueToCheck)) {
          logger.debug(`The '$capture' parameter contains an Express-style wildcard character (${wildcards}). Strings are now always interpreted as exact matches; use a RegExp for partial or wildcard matches.`);
        }
      }
      const matchCallback = ({ url }) => {
        if (true) {
          if (url.pathname === captureUrl.pathname && url.origin !== captureUrl.origin) {
            logger.debug(`${capture} only partially matches the cross-origin URL ${url.toString()}. This route will only handle cross-origin requests if they match the entire URL.`);
          }
        }
        return url.href === captureUrl.href;
      };
      route = new Route(matchCallback, handler, method);
    } else if (capture instanceof RegExp) {
      route = new RegExpRoute(capture, handler, method);
    } else if (typeof capture === "function") {
      route = new Route(capture, handler, method);
    } else if (capture instanceof Route) {
      route = capture;
    } else {
      throw new WorkboxError("unsupported-route-type", {
        moduleName: "workbox-routing",
        funcName: "registerRoute",
        paramName: "capture"
      });
    }
    const defaultRouter2 = getOrCreateDefaultRouter();
    defaultRouter2.registerRoute(route);
    return route;
  }

  // node_modules/workbox-precaching/utils/removeIgnoredSearchParams.js
  function removeIgnoredSearchParams(urlObject, ignoreURLParametersMatching = []) {
    for (const paramName of [...urlObject.searchParams.keys()]) {
      if (ignoreURLParametersMatching.some((regExp) => regExp.test(paramName))) {
        urlObject.searchParams.delete(paramName);
      }
    }
    return urlObject;
  }

  // node_modules/workbox-precaching/utils/generateURLVariations.js
  function* generateURLVariations(url, { ignoreURLParametersMatching = [/^utm_/, /^fbclid$/], directoryIndex = "index.html", cleanURLs = true, urlManipulation } = {}) {
    const urlObject = new URL(url, location.href);
    urlObject.hash = "";
    yield urlObject.href;
    const urlWithoutIgnoredParams = removeIgnoredSearchParams(urlObject, ignoreURLParametersMatching);
    yield urlWithoutIgnoredParams.href;
    if (directoryIndex && urlWithoutIgnoredParams.pathname.endsWith("/")) {
      const directoryURL = new URL(urlWithoutIgnoredParams.href);
      directoryURL.pathname += directoryIndex;
      yield directoryURL.href;
    }
    if (cleanURLs) {
      const cleanURL = new URL(urlWithoutIgnoredParams.href);
      cleanURL.pathname += ".html";
      yield cleanURL.href;
    }
    if (urlManipulation) {
      const additionalURLs = urlManipulation({ url: urlObject });
      for (const urlToAttempt of additionalURLs) {
        yield urlToAttempt.href;
      }
    }
  }

  // node_modules/workbox-precaching/PrecacheRoute.js
  var PrecacheRoute = class extends Route {
    /**
     * @param {PrecacheController} precacheController A `PrecacheController`
     * instance used to both match requests and respond to fetch events.
     * @param {Object} [options] Options to control how requests are matched
     * against the list of precached URLs.
     * @param {string} [options.directoryIndex=index.html] The `directoryIndex` will
     * check cache entries for a URLs ending with '/' to see if there is a hit when
     * appending the `directoryIndex` value.
     * @param {Array<RegExp>} [options.ignoreURLParametersMatching=[/^utm_/, /^fbclid$/]] An
     * array of regex's to remove search params when looking for a cache match.
     * @param {boolean} [options.cleanURLs=true] The `cleanURLs` option will
     * check the cache for the URL with a `.html` added to the end of the end.
     * @param {workbox-precaching~urlManipulation} [options.urlManipulation]
     * This is a function that should take a URL and return an array of
     * alternative URLs that should be checked for precache matches.
     */
    constructor(precacheController2, options) {
      const match = ({ request }) => {
        const urlsToCacheKeys = precacheController2.getURLsToCacheKeys();
        for (const possibleURL of generateURLVariations(request.url, options)) {
          const cacheKey = urlsToCacheKeys.get(possibleURL);
          if (cacheKey) {
            const integrity = precacheController2.getIntegrityForCacheKey(cacheKey);
            return { cacheKey, integrity };
          }
        }
        if (true) {
          logger.debug(`Precaching did not find a match for ` + getFriendlyURL(request.url));
        }
        return;
      };
      super(match, precacheController2.strategy);
    }
  };

  // node_modules/workbox-precaching/addRoute.js
  function addRoute(options) {
    const precacheController2 = getOrCreatePrecacheController();
    const precacheRoute = new PrecacheRoute(precacheController2, options);
    registerRoute(precacheRoute);
  }

  // node_modules/workbox-precaching/precache.js
  function precache(entries) {
    const precacheController2 = getOrCreatePrecacheController();
    precacheController2.precache(entries);
  }

  // node_modules/workbox-precaching/precacheAndRoute.js
  function precacheAndRoute(entries, options) {
    precache(entries);
    addRoute(options);
  }

  // node_modules/workbox-strategies/utils/messages.js
  var messages2 = {
    strategyStart: (strategyName, request) => `Using ${strategyName} to respond to '${getFriendlyURL(request.url)}'`,
    printFinalResponse: (response) => {
      if (response) {
        logger.groupCollapsed(`View the final response here.`);
        logger.log(response || "[No response returned]");
        logger.groupEnd();
      }
    }
  };

  // node_modules/workbox-strategies/CacheFirst.js
  var CacheFirst = class extends Strategy {
    /**
     * @private
     * @param {Request|string} request A request to run this strategy for.
     * @param {workbox-strategies.StrategyHandler} handler The event that
     *     triggered the request.
     * @return {Promise<Response>}
     */
    async _handle(request, handler) {
      const logs = [];
      if (true) {
        finalAssertExports.isInstance(request, Request, {
          moduleName: "workbox-strategies",
          className: this.constructor.name,
          funcName: "makeRequest",
          paramName: "request"
        });
      }
      let response = await handler.cacheMatch(request);
      let error = void 0;
      if (!response) {
        if (true) {
          logs.push(`No response found in the '${this.cacheName}' cache. Will respond with a network request.`);
        }
        try {
          response = await handler.fetchAndCachePut(request);
        } catch (err) {
          if (err instanceof Error) {
            error = err;
          }
        }
        if (true) {
          if (response) {
            logs.push(`Got response from network.`);
          } else {
            logs.push(`Unable to get a response from the network.`);
          }
        }
      } else {
        if (true) {
          logs.push(`Found a cached response in the '${this.cacheName}' cache.`);
        }
      }
      if (true) {
        logger.groupCollapsed(messages2.strategyStart(this.constructor.name, request));
        for (const log of logs) {
          logger.log(log);
        }
        messages2.printFinalResponse(response);
        logger.groupEnd();
      }
      if (!response) {
        throw new WorkboxError("no-response", { url: request.url, error });
      }
      return response;
    }
  };

  // esm/runtime/cache-utils.js
  var REGISTERROUTE = "RegisterRoute";
  var CACHEFIRST = "CacheFirst";
  var CACHEABLERESPONSEPLUGIN = "CacheableResponsePlugin";

  // esm/sutta-player-sw-stub.js
  precacheAndRoute([{"revision":"2de371875e5faef7df3f8a499106cd24","url":"css/custom.css"},{"revision":"39f2989c158319daf02e9d4fc0bad1b5","url":"css/pico-1.5.9/pico.min.css"},{"revision":"6bb3037f2d316dc90e519f04d0e59f86","url":"esm/app-config.json"},{"revision":"fa72a71018c5bc1878084166775fa805","url":"esm/controllers/search-controller.js"},{"revision":"ccfd5fbd14da74118593fdcf4e9486cb","url":"esm/controllers/sutta-player-controller.js"},{"revision":"dc1b780da068835200698c93d4b7625b","url":"esm/models/audio-storage-queryable.js"},{"revision":"1924108246aa8ec580a375e7ecb41a58","url":"esm/models/google-drive/google-drive-audio-db.js"},{"revision":"cfed37b8ba579c0c12e61cd9a95cd96d","url":"esm/models/google-drive/google-drive-audio-db.json"},{"revision":"cc7632b061534f3da312398bf68c1667","url":"esm/models/json-fs/sutta-db.js"},{"revision":"23ca2131802ac8a0ee164a40771a1626","url":"esm/models/json-fs/sutta-db.json"},{"revision":"15735ce97804ca6228d2b8409756c2f9","url":"esm/models/sutta-player-state.js"},{"revision":"c7fcb9d3e2371d93d0a0e4aa1b7fce33","url":"esm/models/sutta-storage-queryable.js"},{"revision":"8609667ac76332e1406cee6950c14896","url":"esm/runtime/cache-utils.js"},{"revision":"ad551d892ba6bd2f7a73307ac4febdc6","url":"esm/runtime/deferred-promise.js"},{"revision":"347d3a5326a56330dda466c9198d90a5","url":"esm/runtime/localstorage-state.js"},{"revision":"631280e7ea0e3d8f35eb44372b723809","url":"esm/runtime/string-utils.js"},{"revision":"4dd4e3eaaf9ea0b788d32292568dc7e1","url":"esm/sutta-player-app.js"},{"revision":"18fa1613841801c99d03955755fcecff","url":"esm/sutta-player-sw-stub.js"},{"revision":"c224aed99587c2e6ffdba2289056dc77","url":"esm/views/event-utils.js"},{"revision":"0ed674bff74045eb6088dc51b59958d7","url":"esm/views/sutta-player-view.js"},{"revision":"967362d1b79eb9e40964a59f05b598ac","url":"favicon.ico"},{"revision":"379f40cb923ae36726ea2f0c5e35c514","url":"img/dhamma-chakka.png"},{"revision":"6368abe9e828248565095224c76eb910","url":"img/dhamma-chakka192.png"},{"revision":"b9d986695719de36dc74df3fffae10e3","url":"index.html"},{"revision":"fa1072e6989a041e4a70bef0a71f6d56","url":"LICENSE_CONTENT_ṭhānissaro_bhikkhu.md"},{"revision":"596dc76b6a7e326158d0988ad1d17f47","url":"manifest.json"},{"revision":"64be0cf0b5b4e42ea9a6dc2cceeda7f4","url":"README.md"},{"revision":"89a36863425509bdba9991e0a3caa271","url":"text/suttas/AN/AN1_140.txt"},{"revision":"802ca6e52030e6783c6016811b202c36","url":"text/suttas/AN/AN1_21.txt"},{"revision":"5a2a58cb324241d667765001bacd0b4a","url":"text/suttas/AN/AN1_329.txt"},{"revision":"83a3e4bcc3947d7d00eb27637c325511","url":"text/suttas/AN/AN1_45.txt"},{"revision":"62257949d73ddd0d715713cec6192f40","url":"text/suttas/AN/AN1_48.txt"},{"revision":"a6841fb1cf2e233fad9ac65ed711c478","url":"text/suttas/AN/AN1_49.txt"},{"revision":"763c9a5c45d85f3d89d5d6caafc03a59","url":"text/suttas/AN/AN1_50.txt"},{"revision":"6fee951f0465555314a80617896bad69","url":"text/suttas/AN/AN10_101.txt"},{"revision":"60747d89df998a7907a538ebf0aed7b0","url":"text/suttas/AN/AN10_103.txt"},{"revision":"aa600cdc55e3c3f00b2b7b5e639beeb2","url":"text/suttas/AN/AN10_104.txt"},{"revision":"39a7eabb7083ee6c923a1022a450bf67","url":"text/suttas/AN/AN10_108.txt"},{"revision":"358610f42adde89f8497cb045ddb18c6","url":"text/suttas/AN/AN10_118.txt"},{"revision":"64885b9e7c86dcb80ffb709c53f0e161","url":"text/suttas/AN/AN10_13.txt"},{"revision":"fe6d136c93cd94a3a39fd9615d13a99d","url":"text/suttas/AN/AN10_15.txt"},{"revision":"5c4944f355eb4d2a6fa5ad13d6690239","url":"text/suttas/AN/AN10_165.txt"},{"revision":"46841f4497ec1710666c116182a6fe95","url":"text/suttas/AN/AN10_166.txt"},{"revision":"d06b2b939326586d96ec7859854ecf60","url":"text/suttas/AN/AN10_17.txt"},{"revision":"67db3f1339ff3b667863984520f8ef48","url":"text/suttas/AN/AN10_18.txt"},{"revision":"ea1cb98c4c31b1d87ae86f990d332302","url":"text/suttas/AN/AN10_196.txt"},{"revision":"fb2548994735b5091349c8107c2ae8c7","url":"text/suttas/AN/AN10_20.txt"},{"revision":"4ef0a7c22cee0c14f0e5cfe39ba4aaa4","url":"text/suttas/AN/AN10_24.txt"},{"revision":"9ad67722c0c77cc188d7cb49fe47ef26","url":"text/suttas/AN/AN10_29.txt"},{"revision":"f9499fd0a693c2baf47f8876e17da993","url":"text/suttas/AN/AN10_46.txt"},{"revision":"c5510330ac193be210ce753b6dcae13a","url":"text/suttas/AN/AN10_48.txt"},{"revision":"efc32445b59bf73c6db44200ef6bcf28","url":"text/suttas/AN/AN10_51.txt"},{"revision":"a7d1b04d40794b06297ec393d2a49c91","url":"text/suttas/AN/AN10_54.txt"},{"revision":"d4c819a4335d8df0ec5d7455441fb83c","url":"text/suttas/AN/AN10_58.txt"},{"revision":"3730c868252908297dedd3b8399530d4","url":"text/suttas/AN/AN10_6.txt"},{"revision":"bf7d215e6944d9dd1a1638b289ae8029","url":"text/suttas/AN/AN10_60.txt"},{"revision":"d9414d0f319c6f8b43ae36e82a4d249b","url":"text/suttas/AN/AN10_61.txt"},{"revision":"c113997db9dce60ca6c6ddb49a82ce0c","url":"text/suttas/AN/AN10_69.txt"},{"revision":"51f3e1f8b4d581698ea0970964f14199","url":"text/suttas/AN/AN10_7.txt"},{"revision":"517a4b535a8cdbbde6b26b6c221c5c20","url":"text/suttas/AN/AN10_70.txt"},{"revision":"4bfc2ad1ece06a699d6c693a0884d9c6","url":"text/suttas/AN/AN10_71.txt"},{"revision":"46f03ad529e439391a0421abccde7f28","url":"text/suttas/AN/AN10_72.txt"},{"revision":"e3ea91f5eedb325d92302d53318b9c45","url":"text/suttas/AN/AN10_73.txt"},{"revision":"084a82e739ebf1d8a3fd0c0ff3925880","url":"text/suttas/AN/AN10_75.txt"},{"revision":"dbb9edd2c1358d6758bd30b8385d299a","url":"text/suttas/AN/AN10_76.txt"},{"revision":"47df9c01b9af922bf6446c74d19d89e5","url":"text/suttas/AN/AN10_80.txt"},{"revision":"7e08186f698715f013c8898a62a6d5e7","url":"text/suttas/AN/AN10_81.txt"},{"revision":"5be02761c3446c743984ec8139bac671","url":"text/suttas/AN/AN10_92.txt"},{"revision":"13f652292bcfaab4f6c3da76c62b0853","url":"text/suttas/AN/AN10_93.txt"},{"revision":"2e21527233d89d69a701cd539e2118aa","url":"text/suttas/AN/AN10_94.txt"},{"revision":"14bcae4286c14f654a0bf13e494fc425","url":"text/suttas/AN/AN10_95.txt"},{"revision":"ef58406157178cb6ae55bafe43283530","url":"text/suttas/AN/AN10_96.txt"},{"revision":"30f33a732d9054532f4ff5b2d01e9fb2","url":"text/suttas/AN/AN10_99.txt"},{"revision":"b1d2977ade4318381e4fa35325acde56","url":"text/suttas/AN/AN11_1.txt"},{"revision":"e9b88699ef2e47ec39076a332247f071","url":"text/suttas/AN/AN11_10.txt"},{"revision":"73da74a131149e3e782e98af7b85f0f9","url":"text/suttas/AN/AN11_12.txt"},{"revision":"61ab082cf17ba2e3120d7363b3bc0a8f","url":"text/suttas/AN/AN11_13.txt"},{"revision":"4960afd477aa2cea31ea12532fb5affc","url":"text/suttas/AN/AN11_16.txt"},{"revision":"328bcdaf17264c2da4f7807270c4b8f9","url":"text/suttas/AN/AN11_2.txt"},{"revision":"e435ae0a003a62c46e32f29e59b0cf36","url":"text/suttas/AN/AN2_118.txt"},{"revision":"02d8a0004284a2048959cd630a4cebff","url":"text/suttas/AN/AN2_120.txt"},{"revision":"d6c143ac53277afc83d343ea4d70b670","url":"text/suttas/AN/AN2_123.txt"},{"revision":"d3c02114d700439155ee221c0b57aa49","url":"text/suttas/AN/AN2_134.txt"},{"revision":"012a9af181ff3f21fe0f7fc49b0a6a4e","url":"text/suttas/AN/AN2_18.txt"},{"revision":"3342667e461c9e935b0fef936b28917a","url":"text/suttas/AN/AN2_19.txt"},{"revision":"1c88eed89b83f80d479876a5ff21cf3f","url":"text/suttas/AN/AN2_21.txt"},{"revision":"7b498f7230511c44b82fda974c7c064b","url":"text/suttas/AN/AN2_23.txt"},{"revision":"7adfb20a3d4e9c3378f29f0692e507af","url":"text/suttas/AN/AN2_24.txt"},{"revision":"49963be5f4d7667d79d36efe5abc9d38","url":"text/suttas/AN/AN2_29.txt"},{"revision":"d827f3c6346aec0ff7da925460dd0f43","url":"text/suttas/AN/AN2_30.txt"},{"revision":"d674f75672e8b2966da05fce6b586795","url":"text/suttas/AN/AN2_31.txt"},{"revision":"13f5ae9c3ddccd9e247f34fa8592bd3e","url":"text/suttas/AN/AN2_35.txt"},{"revision":"4734c564882077d70854d7772e245890","url":"text/suttas/AN/AN2_36.txt"},{"revision":"7c65c8e55b56fa3eddb70f4327919dd4","url":"text/suttas/AN/AN2_37.txt"},{"revision":"57878a378d8da1e5f0166da4c1c38a57","url":"text/suttas/AN/AN2_46.txt"},{"revision":"4449dc79370d17ca7500494aef11cac2","url":"text/suttas/AN/AN2_5.txt"},{"revision":"277649c960dd1e66950285d829fe13d4","url":"text/suttas/AN/AN2_61.txt"},{"revision":"45cc26e3c2f3d5aa4bbe7039a4b7e29c","url":"text/suttas/AN/AN2_74.txt"},{"revision":"abac395b773240e2b10c779ccc794861","url":"text/suttas/AN/AN2_9.txt"},{"revision":"ea065ab6f018a5a85eee842cb8225052","url":"text/suttas/AN/AN2_99.txt"},{"revision":"da4824c576dd189e7697ab5c06dc5ef1","url":"text/suttas/AN/AN3_10.txt"},{"revision":"cb9d58b826531ac634392e137f004eea","url":"text/suttas/AN/AN3_101.txt"},{"revision":"2e75646e1fccf6f55a8e74d753fe63b4","url":"text/suttas/AN/AN3_102.txt"},{"revision":"add75ade0451cca844000fa97b50345f","url":"text/suttas/AN/AN3_103.txt"},{"revision":"db4bcb9e88a11b9a66f879f3560f4f8c","url":"text/suttas/AN/AN3_109.txt"},{"revision":"216638b77b77a83176eda7f1635c0aeb","url":"text/suttas/AN/AN3_110.txt"},{"revision":"714668b33e401050fff528dec2776876","url":"text/suttas/AN/AN3_112.txt"},{"revision":"1259795a825b51f76c3bf6595c12763e","url":"text/suttas/AN/AN3_113.txt"},{"revision":"ec7551bd0a0d6d5a767a46a41f6e54d1","url":"text/suttas/AN/AN3_115.txt"},{"revision":"f0eda328c63c51dff73621315faf1eb3","url":"text/suttas/AN/AN3_116.txt"},{"revision":"5e6574cb5e5bbb488a2e79bd6727716d","url":"text/suttas/AN/AN3_117.txt"},{"revision":"fa25642e9eac986b523bc75691802e50","url":"text/suttas/AN/AN3_121.txt"},{"revision":"6c04fa49d072ca2fa01c0e453f68f501","url":"text/suttas/AN/AN3_122.txt"},{"revision":"472707b09b77ae52e2734c4991ba6ead","url":"text/suttas/AN/AN3_123.txt"},{"revision":"ac10d94baf864f346bc6398432cc64f4","url":"text/suttas/AN/AN3_124.txt"},{"revision":"4b7262dde715b6b454c3898b28abf67a","url":"text/suttas/AN/AN3_126.txt"},{"revision":"155af76f0ff8778ee1d114e8720b1591","url":"text/suttas/AN/AN3_129.txt"},{"revision":"e5f8bbe2ba2969b6cfd557ff7fc5b3d8","url":"text/suttas/AN/AN3_131.txt"},{"revision":"2c588ef7aa9543b5532c1bf78259b0fb","url":"text/suttas/AN/AN3_133.txt"},{"revision":"e4b3186db552112945056b3fe4139a9d","url":"text/suttas/AN/AN3_136.txt"},{"revision":"55d79a800cc7b88f8a3995d394631530","url":"text/suttas/AN/AN3_137.txt"},{"revision":"36e06f720fe7d683807d23407b3c5e59","url":"text/suttas/AN/AN3_15.txt"},{"revision":"b53c764062362e33a26241ee8d7ebff2","url":"text/suttas/AN/AN3_2.txt"},{"revision":"5ad335aee4a8aa4d6119d2d1a936d6b4","url":"text/suttas/AN/AN3_20.txt"},{"revision":"a721f7d3062ac27e341dc50ce5ae854d","url":"text/suttas/AN/AN3_22.txt"},{"revision":"f92ac36be871e56c6bf78abd3bd3b903","url":"text/suttas/AN/AN3_24.txt"},{"revision":"e3aa5c112488030e2814f48175b7a82c","url":"text/suttas/AN/AN3_30.txt"},{"revision":"37ca73b5054a62929dd67b8ffb1e2104","url":"text/suttas/AN/AN3_32.txt"},{"revision":"fb149e66e54d7467a41a1b74d939e3f1","url":"text/suttas/AN/AN3_33.txt"},{"revision":"719050c2d995974574a42fb7fa53cd84","url":"text/suttas/AN/AN3_34.txt"},{"revision":"dead4f607a10ef278b2d6019a602c9ef","url":"text/suttas/AN/AN3_35.txt"},{"revision":"b388a85445727a842b4120f31c3a9456","url":"text/suttas/AN/AN3_39.txt"},{"revision":"30d96b6c1f86c8f189fe31a13a5de59f","url":"text/suttas/AN/AN3_40.txt"},{"revision":"762134afc1e840ba47219b8e002558b1","url":"text/suttas/AN/AN3_42.txt"},{"revision":"675ec336412062290673910fe0c406d8","url":"text/suttas/AN/AN3_47.txt"},{"revision":"0b130ef0d5d2a7815206222dadd6a0dc","url":"text/suttas/AN/AN3_49.txt"},{"revision":"0544a586c4ca1df325ad7c1559541d0a","url":"text/suttas/AN/AN3_5.txt"},{"revision":"48c74882f1d7a9f9f3e04feecd84baa1","url":"text/suttas/AN/AN3_50.txt"},{"revision":"e40c3f3f5aab01aaf26c0f9a2e3eac5f","url":"text/suttas/AN/AN3_52.txt"},{"revision":"903e16d5464dc84009b6a9dafbe61647","url":"text/suttas/AN/AN3_53.txt"},{"revision":"349e4070a0b68693eeb929109f046ca4","url":"text/suttas/AN/AN3_58.txt"},{"revision":"4eefec465cf830bf566ce54f56654b66","url":"text/suttas/AN/AN3_61.txt"},{"revision":"f7ce530eb4126b01e669f1a5a1edd9fb","url":"text/suttas/AN/AN3_62.txt"},{"revision":"6c17a084867915556ce2d01aeefee27d","url":"text/suttas/AN/AN3_63.txt"},{"revision":"8a362152d84325a0096649efa41ffeb1","url":"text/suttas/AN/AN3_66.txt"},{"revision":"44673d6ec25bc9b757602d5aae3b88d7","url":"text/suttas/AN/AN3_68.txt"},{"revision":"f4cde39f2f8e6524daf61bc8da777f33","url":"text/suttas/AN/AN3_69.txt"},{"revision":"ff6e7ce5bd9b6a01148d8f7fd01e373d","url":"text/suttas/AN/AN3_70.txt"},{"revision":"9ac057d26f1935d253555f5a210be099","url":"text/suttas/AN/AN3_71.txt"},{"revision":"fb3284d929c1dc59849ea480f3118da3","url":"text/suttas/AN/AN3_72.txt"},{"revision":"9bb29b649ab9a668331897b25939e28e","url":"text/suttas/AN/AN3_73.txt"},{"revision":"af4f3cbd8680c3c4fb700a3fa38c5cfc","url":"text/suttas/AN/AN3_74.txt"},{"revision":"543638eefc0a83a92a6c848726d2450d","url":"text/suttas/AN/AN3_77.txt"},{"revision":"701b539060239c02a1c61f9faa597bda","url":"text/suttas/AN/AN3_78.txt"},{"revision":"8b843084ec189ae42260052c0f25cc31","url":"text/suttas/AN/AN3_79.txt"},{"revision":"b3561a69ced9a20d22dbdcfbbbd8165b","url":"text/suttas/AN/AN3_83.txt"},{"revision":"3f3e90fdee35ab43472206516ad3bc48","url":"text/suttas/AN/AN3_85.txt"},{"revision":"3b5934d085fb24abb9ad485ad80c994d","url":"text/suttas/AN/AN3_87.txt"},{"revision":"03da5920056a77c6f7355f56c3acd17b","url":"text/suttas/AN/AN3_88.txt"},{"revision":"9ece87709c69207a9ffdd37a6910dc4b","url":"text/suttas/AN/AN3_90.txt"},{"revision":"5afb4e984bcade09f50a764334c09b75","url":"text/suttas/AN/AN3_91.txt"},{"revision":"aa59271af1c2648cd8123ab5d8a3b050","url":"text/suttas/AN/AN3_93.txt"},{"revision":"10a4806ad4f36ce4afa6767b38ad369f","url":"text/suttas/AN/AN3_95.txt"},{"revision":"de07f61da3aaa0fb18ff21ef2a2f2155","url":"text/suttas/AN/AN3_96.txt"},{"revision":"2a06f6d2382fde90c0790eaa35ebd49b","url":"text/suttas/AN/AN3_97.txt"},{"revision":"115561f66a4981e2faab65ac0df675d3","url":"text/suttas/AN/AN4_1.txt"},{"revision":"d160a68be673b9f0944bd5f5c99180c0","url":"text/suttas/AN/AN4_10.txt"},{"revision":"bab95ef9a8358f6ece167fd3b5e4fe94","url":"text/suttas/AN/AN4_100.txt"},{"revision":"e46267eda292d1faf181ff8215bafbd0","url":"text/suttas/AN/AN4_102.txt"},{"revision":"c495014567dc50be84ea370d086c5acc","url":"text/suttas/AN/AN4_111.txt"},{"revision":"03b3e5a668849da60d90253bb94cb672","url":"text/suttas/AN/AN4_113.txt"},{"revision":"664c49d9b2d832039c4e8d676d9b3a72","url":"text/suttas/AN/AN4_115.txt"},{"revision":"68f6454bedee7780bc65119b59d02268","url":"text/suttas/AN/AN4_116.txt"},{"revision":"7091c0fd64377de2df301f969e77d601","url":"text/suttas/AN/AN4_117.txt"},{"revision":"68e825fd41629c8de535afe646f5a840","url":"text/suttas/AN/AN4_123.txt"},{"revision":"96b07f3aa0916295994a3b8a482a0384","url":"text/suttas/AN/AN4_124.txt"},{"revision":"8300a52268b6f48ebd88cdac7b74d6f0","url":"text/suttas/AN/AN4_125.txt"},{"revision":"4e78e936faa398376849326a89084fb3","url":"text/suttas/AN/AN4_126.txt"},{"revision":"5a8e57bdda57051c04b0054734f7dfbb","url":"text/suttas/AN/AN4_128.txt"},{"revision":"5f1ff9c8f1b810b62c44c47f808ad386","url":"text/suttas/AN/AN4_131.txt"},{"revision":"b7bbe509ef6aecc5ee3eaf1b4ed1f205","url":"text/suttas/AN/AN4_138.txt"},{"revision":"7a8014b2c5515943fc07ec6153aa6d0f","url":"text/suttas/AN/AN4_144.txt"},{"revision":"d1e34d2f8bd30de0ff0fcb334bccd595","url":"text/suttas/AN/AN4_156.txt"},{"revision":"b35a11268593b0965025b74dddebf921","url":"text/suttas/AN/AN4_158.txt"},{"revision":"4b3cd53811e38b25e2e00a5f1d6cd88d","url":"text/suttas/AN/AN4_159.txt"},{"revision":"1f316878789f83bf2088284f74be8c4b","url":"text/suttas/AN/AN4_160.txt"},{"revision":"7e3a1930b7fb06dc9bad2e54db8d8a09","url":"text/suttas/AN/AN4_162.txt"},{"revision":"3d709cf5d87b8f2f5dd70272eab23bbb","url":"text/suttas/AN/AN4_163.txt"},{"revision":"fb18c88c53d2839cb91758bc326cb31f","url":"text/suttas/AN/AN4_164.txt"},{"revision":"8a7170c72541d791d46c045a0384958c","url":"text/suttas/AN/AN4_165.txt"},{"revision":"addc6541b0447d9953f7bc87421aaba1","url":"text/suttas/AN/AN4_170.txt"},{"revision":"2f07d0e840c7b8db51dcf14110dd3889","url":"text/suttas/AN/AN4_173.txt"},{"revision":"d9691d5f82612402e9c889e386cc1456","url":"text/suttas/AN/AN4_178.txt"},{"revision":"db279cf7e464acb0309a3d855081e60c","url":"text/suttas/AN/AN4_179.txt"},{"revision":"6e4be7784f9769247b407355d59b12ac","url":"text/suttas/AN/AN4_181.txt"},{"revision":"7183c8c0ae1c2eb3b781cae540638bfc","url":"text/suttas/AN/AN4_182.txt"},{"revision":"367f194d8c7f23a6dfeaddc3f037f72e","url":"text/suttas/AN/AN4_183.txt"},{"revision":"4d14649748e6e88ac33546b053037663","url":"text/suttas/AN/AN4_184.txt"},{"revision":"31755e6b891e4f5dbe953da36f3f7894","url":"text/suttas/AN/AN4_19.txt"},{"revision":"87d76f2992ab0bac821871e5125b9177","url":"text/suttas/AN/AN4_191.txt"},{"revision":"b38e56beb085b082d51eea0f65eab9bd","url":"text/suttas/AN/AN4_192.txt"},{"revision":"6e0df5d96feacb135e65895f56c6352c","url":"text/suttas/AN/AN4_194.txt"},{"revision":"ae3e899ae052a6449fc5ac8d46c669c3","url":"text/suttas/AN/AN4_195.txt"},{"revision":"b625300a04577bd919203f2b0c714397","url":"text/suttas/AN/AN4_199.txt"},{"revision":"41175d5ee7b7bc12fdb220dc6ca140a7","url":"text/suttas/AN/AN4_200.txt"},{"revision":"e031cbf93d3297077aa3c14b4245b987","url":"text/suttas/AN/AN4_201.txt"},{"revision":"9727a66f540c255d2eee10e2995203be","url":"text/suttas/AN/AN4_237.txt"},{"revision":"2b54a80271ddfb9ceab0d356324906f2","url":"text/suttas/AN/AN4_24.txt"},{"revision":"65f77bae75e5bb6adcfde67c0baedada","url":"text/suttas/AN/AN4_245.txt"},{"revision":"9aa53dc96c4ff188de83326d1098aaff","url":"text/suttas/AN/AN4_252.txt"},{"revision":"5bd412a76f4090f4edcec65eb36a1802","url":"text/suttas/AN/AN4_255.txt"},{"revision":"003ce54141f994e60442c964d6571b68","url":"text/suttas/AN/AN4_263.txt"},{"revision":"46d53c92e3f0eda109e9876ed00e5a63","url":"text/suttas/AN/AN4_28.txt"},{"revision":"211f8d01b781997275233847ce304f73","url":"text/suttas/AN/AN4_31.txt"},{"revision":"62c2b87c169f1e9e9294280b171bdd70","url":"text/suttas/AN/AN4_32.txt"},{"revision":"949d876ef248d51a401395aa6964af01","url":"text/suttas/AN/AN4_33.txt"},{"revision":"0833622c0b341eb268bec62bdbdd7a09","url":"text/suttas/AN/AN4_35.txt"},{"revision":"164722669cf1100e03f2bd95067ed462","url":"text/suttas/AN/AN4_36.txt"},{"revision":"3c1484542002adcc7ee11a4e9b370269","url":"text/suttas/AN/AN4_37.txt"},{"revision":"7649bd9457bd1d9eebbeedee77743d01","url":"text/suttas/AN/AN4_38.txt"},{"revision":"92b3669ce52f5c22cc0a1868cb7a651e","url":"text/suttas/AN/AN4_41.txt"},{"revision":"a28d2d7135bc75204a98f84f7214d52f","url":"text/suttas/AN/AN4_42.txt"},{"revision":"4856903986c185c337af0ef7b409f734","url":"text/suttas/AN/AN4_45.txt"},{"revision":"d263e48c96aa60f291cd9841b078d913","url":"text/suttas/AN/AN4_49.txt"},{"revision":"ddb0d2da5e32cf92ae478bf0ab676f7e","url":"text/suttas/AN/AN4_5.txt"},{"revision":"8c1ec886eed1359f4965fb8d376e95c5","url":"text/suttas/AN/AN4_50.txt"},{"revision":"3f3f05dc71d2ef71020649c940b858ba","url":"text/suttas/AN/AN4_55.txt"},{"revision":"c1da497a53e3b6fc7ea4afcc1e1c5cd3","url":"text/suttas/AN/AN4_62.txt"},{"revision":"5265df3515808c4205e4fa68b06e2ea3","url":"text/suttas/AN/AN4_67.txt"},{"revision":"73de0f635417d4e60b41161b4f9bd810","url":"text/suttas/AN/AN4_73.txt"},{"revision":"4c0464c9cba350062f1e3f1097f4d8bd","url":"text/suttas/AN/AN4_77.txt"},{"revision":"1d5272d89d3a342af54409e3b038829b","url":"text/suttas/AN/AN4_79.txt"},{"revision":"c67146659545375f560cbcace969d789","url":"text/suttas/AN/AN4_85.txt"},{"revision":"07dd9f4e2bb1aba105265a56ca713581","url":"text/suttas/AN/AN4_87.txt"},{"revision":"2f5ea674b3e5af36905172d96fd3735b","url":"text/suttas/AN/AN4_88.txt"},{"revision":"a2c19580fe1b2c533a2efca86b136d1d","url":"text/suttas/AN/AN4_89.txt"},{"revision":"3991b52a909a78571ed8407ead51aa30","url":"text/suttas/AN/AN4_90.txt"},{"revision":"c919084019ebb067d8fa78ac1c4785ad","url":"text/suttas/AN/AN4_94.txt"},{"revision":"28da7c2f493e4f9e2247076240b21a63","url":"text/suttas/AN/AN4_95.txt"},{"revision":"0660a0e307f77062a5b368db3e48d715","url":"text/suttas/AN/AN4_96.txt"},{"revision":"be4213e79e9a31efcdf131afcbc96916","url":"text/suttas/AN/AN4_99.txt"},{"revision":"e903907f22a2ff5eb02ce1314efb8ca4","url":"text/suttas/AN/AN5_106.txt"},{"revision":"cd34881415612ce031aac775b7277620","url":"text/suttas/AN/AN5_109.txt"},{"revision":"3addc17049d0dd0a341ae00f81a537d7","url":"text/suttas/AN/AN5_110.txt"},{"revision":"db6e5e81401b9f27c957014d989ede8c","url":"text/suttas/AN/AN5_114.txt"},{"revision":"433259fd62d58316c8a96175ae197eef","url":"text/suttas/AN/AN5_121.txt"},{"revision":"a8a4147e1326c1c726942a741dc7b0d1","url":"text/suttas/AN/AN5_129.txt"},{"revision":"fed2836f348dac43333e7b89e2643e93","url":"text/suttas/AN/AN5_130.txt"},{"revision":"97e46629eb0de3a488442b68f13a1eda","url":"text/suttas/AN/AN5_137.txt"},{"revision":"ba9031907c9dd46f10a85eb1a5d5292c","url":"text/suttas/AN/AN5_139.txt"},{"revision":"e3e15cb8eadf17306f92f5b0605068b7","url":"text/suttas/AN/AN5_140.txt"},{"revision":"fe3728857bad894b8d9945d240a10993","url":"text/suttas/AN/AN5_148.txt"},{"revision":"41a50f85695ff364459368eb43ab91ba","url":"text/suttas/AN/AN5_151.txt"},{"revision":"7b4f5804952d2583c69419f0215ccbae","url":"text/suttas/AN/AN5_152.txt"},{"revision":"84d668f9bf785a467d26baece74dc341","url":"text/suttas/AN/AN5_159.txt"},{"revision":"566ad33e5809ea18c80204b5f67c533d","url":"text/suttas/AN/AN5_161.txt"},{"revision":"c681e6966fa618306f09eeceda255a90","url":"text/suttas/AN/AN5_162.txt"},{"revision":"1a410e87cebca8e200340d43282fb7f9","url":"text/suttas/AN/AN5_165.txt"},{"revision":"07cda86c9c856d50f320ae6de6fb6f3d","url":"text/suttas/AN/AN5_166.txt"},{"revision":"f6f031518fbd0c3e00e12ab060ac3914","url":"text/suttas/AN/AN5_170.txt"},{"revision":"91b513ca2286bee6481fc3b6eb41d82a","url":"text/suttas/AN/AN5_175.txt"},{"revision":"40e5c6452f83771ba3dcde99e01b3289","url":"text/suttas/AN/AN5_176.txt"},{"revision":"20c657a6f887c0eefc1e27bb60f5c1ce","url":"text/suttas/AN/AN5_177.txt"},{"revision":"235acd73a6fc31e0f6e1a46967a178f7","url":"text/suttas/AN/AN5_179.txt"},{"revision":"4f7225f57eba9b5f14c5c582031ed611","url":"text/suttas/AN/AN5_180.txt"},{"revision":"2d924be6586eb17f1defba2ff8697c4c","url":"text/suttas/AN/AN5_191.txt"},{"revision":"def6ce9413c8fe2c744478edf9d19da7","url":"text/suttas/AN/AN5_196.txt"},{"revision":"79bebc99fdb885b0b4b7d957f6bdec2d","url":"text/suttas/AN/AN5_198.txt"},{"revision":"e88bc5245b727d22338d5afa0d6eab5e","url":"text/suttas/AN/AN5_199.txt"},{"revision":"55841f1e168554eac3fd64308c592997","url":"text/suttas/AN/AN5_2.txt"},{"revision":"60851f9c59d58fff25c6397f83c83d93","url":"text/suttas/AN/AN5_20.txt"},{"revision":"2f4dfa82f81f197d03efc984f6fa39c4","url":"text/suttas/AN/AN5_200.txt"},{"revision":"832a242c8ea4b0161e56bee0ca986a16","url":"text/suttas/AN/AN5_202.txt"},{"revision":"cce3f0e752854b2bf61cf504e70dbc4c","url":"text/suttas/AN/AN5_23.txt"},{"revision":"7b5690150a63de8e98db10bc11445d50","url":"text/suttas/AN/AN5_25.txt"},{"revision":"c6ced452b4d869a0299eac9034cb4393","url":"text/suttas/AN/AN5_254.txt"},{"revision":"a438382a55887dc1851c720f7f122878","url":"text/suttas/AN/AN5_26.txt"},{"revision":"1e61da0a0695bc467b32bb4b5ba4a53d","url":"text/suttas/AN/AN5_27.txt"},{"revision":"bf2fb3f68c00298a863e8a7a7d178e1e","url":"text/suttas/AN/AN5_28.txt"},{"revision":"711b6fb0506636da06f4105f304ccf8e","url":"text/suttas/AN/AN5_29.txt"},{"revision":"c9f048d736b92434c64cd1fc2db1927b","url":"text/suttas/AN/AN5_30.txt"},{"revision":"58fcf0cfb2e17033541ba2672614892a","url":"text/suttas/AN/AN5_31.txt"},{"revision":"8df3a31e8ddea82bc93c49447dcb0cfa","url":"text/suttas/AN/AN5_34.txt"},{"revision":"9fb5b52c24fbbdacb9d5a311c945e472","url":"text/suttas/AN/AN5_36.txt"},{"revision":"5983bc4e61addee26cf63adddf56cf87","url":"text/suttas/AN/AN5_37.txt"},{"revision":"231f82e24fe86c4b0e093f92201d46fb","url":"text/suttas/AN/AN5_38.txt"},{"revision":"c67e03b1184358e29de8c624ac977a52","url":"text/suttas/AN/AN5_41.txt"},{"revision":"f428e3afc8b89c15b3475c4cc117aa7e","url":"text/suttas/AN/AN5_43.txt"},{"revision":"63aba2e161c4055f2167f6c7ce7ebd6a","url":"text/suttas/AN/AN5_49.txt"},{"revision":"8dc615816f092ac17001b78fb21efe04","url":"text/suttas/AN/AN5_51.txt"},{"revision":"0774a712c10263425c376de1d5f138e3","url":"text/suttas/AN/AN5_53.txt"},{"revision":"73f990ce173f0e79ec0d91e6c94d5686","url":"text/suttas/AN/AN5_57.txt"},{"revision":"f1a00309c942e93b8530e46ca45e524c","url":"text/suttas/AN/AN5_59.txt"},{"revision":"1d55e75a33dbff6459b415511865cb1d","url":"text/suttas/AN/AN5_60.txt"},{"revision":"91883282c8ac10987b8b6e354210aef6","url":"text/suttas/AN/AN5_7.txt"},{"revision":"e0621b13932229b357f1b8d1c1326426","url":"text/suttas/AN/AN5_73.txt"},{"revision":"73ac6dcdc4af3e7ec8bf0a0876873932","url":"text/suttas/AN/AN5_74.txt"},{"revision":"02cbef5fc3a0cec4209548917ec907b5","url":"text/suttas/AN/AN5_75.txt"},{"revision":"d1153c385a74336d36c52c3bdcd9c135","url":"text/suttas/AN/AN5_76.txt"},{"revision":"ea247705e601f3653b175030a4451de8","url":"text/suttas/AN/AN5_77.txt"},{"revision":"8423c196c1b9e86a12659b3ff6cd3e68","url":"text/suttas/AN/AN5_78.txt"},{"revision":"41e9c5f667aec04397d9da71cf243b59","url":"text/suttas/AN/AN5_79.txt"},{"revision":"1a347e8eb5ecee36316936fe97dada53","url":"text/suttas/AN/AN5_80.txt"},{"revision":"2aad16370825f8f785f260574c696b63","url":"text/suttas/AN/AN5_96.txt"},{"revision":"a76e31a29c4ae7953b71d498af18f5e7","url":"text/suttas/AN/AN5_97.txt"},{"revision":"5dfe920299c0141bd8ccff2c6dbc37a5","url":"text/suttas/AN/AN5_98.txt"},{"revision":"cda0ce88b1238a4fc26ea8080f379845","url":"text/suttas/AN/AN5_99.txt"},{"revision":"a499a1f0009b96fdacb362edd31f3f20","url":"text/suttas/AN/AN6_102.txt"},{"revision":"42c1e59c53af43a66bbadcda95114484","url":"text/suttas/AN/AN6_103.txt"},{"revision":"8d5832f1bfdad5175a2bcba48f3ebb86","url":"text/suttas/AN/AN6_104.txt"},{"revision":"bfaa5d2257a430027817279a3faaec41","url":"text/suttas/AN/AN6_12.txt"},{"revision":"aa90709949b7a7f5ce0a855addc24948","url":"text/suttas/AN/AN6_13.txt"},{"revision":"e10485d8a7ee9ce847eaaf473cefd12f","url":"text/suttas/AN/AN6_16.txt"},{"revision":"6c31ab4216bea1081e050859155093d7","url":"text/suttas/AN/AN6_19.txt"},{"revision":"c79f980ea835cf4574a950a8eefc06ba","url":"text/suttas/AN/AN6_20.txt"},{"revision":"d7fe3aec4c6a36a1894b8b33f92032b5","url":"text/suttas/AN/AN6_31.txt"},{"revision":"5c33a7b19077282fc662bf6d8846e75a","url":"text/suttas/AN/AN6_37.txt"},{"revision":"f20a435cb01b8775fb5e0a07f5750b53","url":"text/suttas/AN/AN6_41.txt"},{"revision":"23b9d6e5e4a43fb5ab871a17811b38be","url":"text/suttas/AN/AN6_42.txt"},{"revision":"15412c45627298cfaef77e22c7ea4989","url":"text/suttas/AN/AN6_43.txt"},{"revision":"445c73f4fd7d078fbf5c5c63d60da9a2","url":"text/suttas/AN/AN6_45.txt"},{"revision":"2aea01d80dc486cb2a7a55f74a2f1061","url":"text/suttas/AN/AN6_46.txt"},{"revision":"da3c25278bfa8fce0f92ba18e8c7bee2","url":"text/suttas/AN/AN6_47.txt"},{"revision":"e2658f28933023a2870e722844cfc2e6","url":"text/suttas/AN/AN6_49.txt"},{"revision":"e459f7e908392c316d4c4edd3e71a06a","url":"text/suttas/AN/AN6_51.txt"},{"revision":"757f8897a7799603b3935109442cc691","url":"text/suttas/AN/AN6_55.txt"},{"revision":"dccfb298a51bb10cbb131d835cdcd0b2","url":"text/suttas/AN/AN6_60.txt"},{"revision":"7094a3daa375ce7376bfe580979e5116","url":"text/suttas/AN/AN6_61.txt"},{"revision":"8db1ab078981ac394391ec745724632d","url":"text/suttas/AN/AN6_63.txt"},{"revision":"886c019a483b4affe906de8361313623","url":"text/suttas/AN/AN6_70.txt"},{"revision":"a55c8980a2ca1a23b946cb3bf4c39364","url":"text/suttas/AN/AN6_71.txt"},{"revision":"4393c7c409cf51876860a2620784cdf9","url":"text/suttas/AN/AN6_73.txt"},{"revision":"cd630c402ec11bff111020f6b7edbc00","url":"text/suttas/AN/AN6_74.txt"},{"revision":"973548ee6807624463a645628dc70ca3","url":"text/suttas/AN/AN6_78.txt"},{"revision":"b0184e2917e04ab41d511ef8b4418d0d","url":"text/suttas/AN/AN6_83.txt"},{"revision":"5b67313e2f6c3d2abdcaf12ef01a05ca","url":"text/suttas/AN/AN6_85.txt"},{"revision":"43a27b26ada9fa6622383752bbf47cd8","url":"text/suttas/AN/AN6_86.txt"},{"revision":"22e90309916743cf69c34e4a3b335706","url":"text/suttas/AN/AN6_87.txt"},{"revision":"e34e2ef909b0093d7236182741dd1367","url":"text/suttas/AN/AN6_88.txt"},{"revision":"ea1c437d2154eacf32cc91a27cba30cf","url":"text/suttas/AN/AN6_91.txt"},{"revision":"df6bceee4e3324c5b3aba50f6189845d","url":"text/suttas/AN/AN6_92.txt"},{"revision":"e73eeffdd96190961fd37fb5c9bf566a","url":"text/suttas/AN/AN6_97.txt"},{"revision":"8ed0ddf7a436b8a569d289b18293d1c7","url":"text/suttas/AN/AN7_11.txt"},{"revision":"3c5aa4d7e733a5ee31307d1e0d76685b","url":"text/suttas/AN/AN7_12.txt"},{"revision":"31d875a3d45fb133caac666f4b08db2c","url":"text/suttas/AN/AN7_15.txt"},{"revision":"85a9ce5d1a2d6dd1af8488706fbd56ac","url":"text/suttas/AN/AN7_21.txt"},{"revision":"9479bccf4c6b723cacb80e129c49d2bf","url":"text/suttas/AN/AN7_31.txt"},{"revision":"ff753cf6cd650ad6651a294b17de7acf","url":"text/suttas/AN/AN7_32.txt"},{"revision":"a6f4066c9f7b4b6fc0647746a851dfb3","url":"text/suttas/AN/AN7_33.txt"},{"revision":"e5aa87f3f2c822f4364506fe27922974","url":"text/suttas/AN/AN7_34.txt"},{"revision":"0742de4305dad77b4a4a8dd29760e78b","url":"text/suttas/AN/AN7_35.txt"},{"revision":"bcc0fd4ae582e00c9835a02c7a95c5e6","url":"text/suttas/AN/AN7_46.txt"},{"revision":"21d750a1e765d8c77d934ea2b5b7370b","url":"text/suttas/AN/AN7_47.txt"},{"revision":"8b2d2962716984551185985bf40f2e2a","url":"text/suttas/AN/AN7_48.txt"},{"revision":"6166597268df0462b3abebe06d75e256","url":"text/suttas/AN/AN7_49.txt"},{"revision":"ba9b6872d05a369729d00dde63a11178","url":"text/suttas/AN/AN7_50.txt"},{"revision":"1b62fcf0411b81717d51741994ed4882","url":"text/suttas/AN/AN7_51.txt"},{"revision":"55460c05164a34cb4804bbfb2f2ff1f9","url":"text/suttas/AN/AN7_54.txt"},{"revision":"6c9aa7cebc5c97cf0fa097d0e1b8ef1f","url":"text/suttas/AN/AN7_56.txt"},{"revision":"a8fd79df1ce9b5ccf06958f73fa0f70f","url":"text/suttas/AN/AN7_58.txt"},{"revision":"401451f5e031fd741619075ae596d088","url":"text/suttas/AN/AN7_6.txt"},{"revision":"387409b0baa4f0a74b130b1d5bff0af6","url":"text/suttas/AN/AN7_60.txt"},{"revision":"2af5870f715d4da26b2564eb1a92bd72","url":"text/suttas/AN/AN7_63.txt"},{"revision":"8882210461010a8151e3f41810fe5f49","url":"text/suttas/AN/AN7_64.txt"},{"revision":"93974501222458c296812beb145d9a0d","url":"text/suttas/AN/AN7_7.txt"},{"revision":"d3807337773ae55916825c39e33291d8","url":"text/suttas/AN/AN7_70.txt"},{"revision":"0d5ca7cedf96d46de7c77eeded057de8","url":"text/suttas/AN/AN7_80.txt"},{"revision":"1b4b4390f38be174b2c214038994a8a0","url":"text/suttas/AN/AN8_103.txt"},{"revision":"17baeaf2fa978fe97bd002d892ae1297","url":"text/suttas/AN/AN8_13.txt"},{"revision":"a3af2b5c250e930c0feca7e0dc636bc5","url":"text/suttas/AN/AN8_14.txt"},{"revision":"7961ccbf532533fe87914ccec23a532b","url":"text/suttas/AN/AN8_19.txt"},{"revision":"e8177b04a6945cb1627da52140281fa7","url":"text/suttas/AN/AN8_2.txt"},{"revision":"9d56a8ea8b64f9da49daa52e156883fe","url":"text/suttas/AN/AN8_22.txt"},{"revision":"7637d354f09816718c37f250c1743419","url":"text/suttas/AN/AN8_23.txt"},{"revision":"290f9fb8aac938798b286dc1c8573976","url":"text/suttas/AN/AN8_24.txt"},{"revision":"15ba433f9917b565d05a31fdc403b6d1","url":"text/suttas/AN/AN8_26.txt"},{"revision":"942bba310e092d663f1290f2d69e2363","url":"text/suttas/AN/AN8_28.txt"},{"revision":"7a7975ea144bb338e1be372ae9ca8906","url":"text/suttas/AN/AN8_30.txt"},{"revision":"48e7631d23225680f4294435600c4ba3","url":"text/suttas/AN/AN8_39.txt"},{"revision":"7dd1f3ea9a0ab107e2f496c9fe7020dc","url":"text/suttas/AN/AN8_40.txt"},{"revision":"3d2cb7827fddb435a83d645ff2c9254a","url":"text/suttas/AN/AN8_51.txt"},{"revision":"affd675b5da8c708c5aec54290bb3730","url":"text/suttas/AN/AN8_53.txt"},{"revision":"db5935a77e6ab14a49902698f9611cd7","url":"text/suttas/AN/AN8_54.txt"},{"revision":"94df4277d6f00bb86fb0eeb642f6033d","url":"text/suttas/AN/AN8_6.txt"},{"revision":"d3ad61c6a1ca3b0cde7bdca6baddcc6b","url":"text/suttas/AN/AN8_61.txt"},{"revision":"79300d354ba82d9981f228700fc4a2d3","url":"text/suttas/AN/AN8_7.txt"},{"revision":"a5a8aa82c5fb2d2e0124a731ae60462b","url":"text/suttas/AN/AN8_70.txt"},{"revision":"9deb703c52c32374b8456d22480b60a0","url":"text/suttas/AN/AN8_71.txt"},{"revision":"e4c1d73cd2a0d0f309c53691bf74bcbe","url":"text/suttas/AN/AN8_8.txt"},{"revision":"2f7b01e134d727219e8ffa01f2fdfe1b","url":"text/suttas/AN/AN8_9.txt"},{"revision":"0194eed1ffd07754ce8f1752466ff83d","url":"text/suttas/AN/AN8_95.txt"},{"revision":"feaf944fb7ced7e6f17cf6d5c5a5d1aa","url":"text/suttas/AN/AN9_1.txt"},{"revision":"9646f99d9bc3c1e3a25f93cc540c65cf","url":"text/suttas/AN/AN9_13.txt"},{"revision":"1c59969918f2d6e0726a640c2b99ddfd","url":"text/suttas/AN/AN9_14.txt"},{"revision":"07169a19f8736b66631651437c88da41","url":"text/suttas/AN/AN9_15.txt"},{"revision":"917e6629f3f90b9c0c60c183be293d6b","url":"text/suttas/AN/AN9_16.txt"},{"revision":"50b66933d93fb3295fb3033fc8804521","url":"text/suttas/AN/AN9_20.txt"},{"revision":"4ad146b534426692e91ee08cd2925145","url":"text/suttas/AN/AN9_24.txt"},{"revision":"5fdb1b13e2afb8ea6f61c0bc66ec01fc","url":"text/suttas/AN/AN9_25.txt"},{"revision":"d23f34b8196cdbf57b3ec9cf11741878","url":"text/suttas/AN/AN9_31.txt"},{"revision":"5f084c312d64a367d748b3d48efaf993","url":"text/suttas/AN/AN9_32.txt"},{"revision":"4747e31564be41d8ff5324ca854d4911","url":"text/suttas/AN/AN9_33.txt"},{"revision":"6c488947b0b97101a982a9c83e7fb15b","url":"text/suttas/AN/AN9_34.txt"},{"revision":"5eb6014402d32fa6f95b24aba8387d2b","url":"text/suttas/AN/AN9_35.txt"},{"revision":"b1e33bef779dbe7c076aefac8ddafa9e","url":"text/suttas/AN/AN9_36.txt"},{"revision":"82f7a20b00f7c060e144f29148a0f8f5","url":"text/suttas/AN/AN9_37.txt"},{"revision":"ec68f253a53a5b2151ed5a7983e87838","url":"text/suttas/AN/AN9_38.txt"},{"revision":"d7e25610d4ef58081564c486a1bfe0ca","url":"text/suttas/AN/AN9_39.txt"},{"revision":"ff026617b6e1955bc1d066d8aaf8d399","url":"text/suttas/AN/AN9_40.txt"},{"revision":"82d3d64168a0d2019d70fcd7295268dc","url":"text/suttas/AN/AN9_41.txt"},{"revision":"dfbe7bcd0362f063030d3d7e338eaf48","url":"text/suttas/AN/AN9_42.txt"},{"revision":"dee19a322dfaf15eb9bbaacff811a4df","url":"text/suttas/AN/AN9_43.txt"},{"revision":"92043a1c4e39a59de141097da3072c47","url":"text/suttas/AN/AN9_44.txt"},{"revision":"89eae234132b8a14555313ef0cb69e6a","url":"text/suttas/AN/AN9_45.txt"},{"revision":"94ace10f25ed963689e0096eabd2b067","url":"text/suttas/AN/AN9_62.txt"},{"revision":"ba9eead805c834a7c55df966e95351d8","url":"text/suttas/AN/AN9_63.txt"},{"revision":"db999f443b1ace13f7be5be1f77f82f6","url":"text/suttas/AN/AN9_64.txt"},{"revision":"e25545f76f13407612bc61e25222eaf5","url":"text/suttas/AN/AN9_7.txt"},{"revision":"ba03f9abcd2fd9a71799192a8794fc46","url":"text/suttas/AN/AN9_8.txt"},{"revision":"bda884ceaeaa1478b075d6b6a003732a","url":"text/suttas/DN/DN01.txt"},{"revision":"88565c3ea44ac6261c092a6f8b3fb195","url":"text/suttas/DN/DN02.txt"},{"revision":"d0d9ea8a8926219416686c087b823b9e","url":"text/suttas/DN/DN09.txt"},{"revision":"ee81bd23fbc819414dee3fad5a7b249e","url":"text/suttas/DN/DN11.txt"},{"revision":"335b89bbe8fddab1fcaefb4405b927d0","url":"text/suttas/DN/DN12.txt"},{"revision":"7ce481f56fd477a2455731055971a4c4","url":"text/suttas/DN/DN15.txt"},{"revision":"a1e5318f5c0292bddb24ae551ecf3cf4","url":"text/suttas/DN/DN16_1.txt"},{"revision":"dbc791a14173c4e77072c34566827c16","url":"text/suttas/DN/DN16_2.txt"},{"revision":"eb8dcbe0d9c911a26455eac241d73307","url":"text/suttas/DN/DN16_3.txt"},{"revision":"b5faaa59f42c71d74a23663597744d67","url":"text/suttas/DN/DN16_4.txt"},{"revision":"9b90a924206b528996adcd2cd95cd10e","url":"text/suttas/DN/DN16_5.txt"},{"revision":"577ded79a78c410f4f0afbbd743c3def","url":"text/suttas/DN/DN16_6.txt"},{"revision":"2208cd88e09cae79b6ac0ddbefd04fa7","url":"text/suttas/DN/DN20.txt"},{"revision":"bf3f7aaa56e781b6fccfb224cf8a4e7e","url":"text/suttas/DN/DN21.txt"},{"revision":"43f536a87f2f1490d7ca6eec23f6be6b","url":"text/suttas/DN/DN22.txt"},{"revision":"505907972204c9ec6b1b8181bdfe67e3","url":"text/suttas/DN/DN26.txt"},{"revision":"80aede4bdb2f3dab09fa4b9f1a45ec3d","url":"text/suttas/DN/DN29.txt"},{"revision":"2da1ea71b90946882299a167f58a1910","url":"text/suttas/DN/DN33_1-5.txt"},{"revision":"28b3df0f839dae18f18c56391e631f45","url":"text/suttas/DN/DN33_6-10.txt"},{"revision":"0211b6f3dafdd5947935b3f744852d5b","url":"text/suttas/DN/DN34_1_5.txt"},{"revision":"32bf8c8c32f62aec3977de6ecb34b897","url":"text/suttas/DN/DN34_6_10.txt"},{"revision":"a01e41062ad50fd7073de37427d4d7f9","url":"text/suttas/KN/Dhp/Ch01.txt"},{"revision":"63bc8cb32f8d87ac5f1f97add6ac3f55","url":"text/suttas/KN/Dhp/Ch02.txt"},{"revision":"fa3ddce0ce312eb6486bf0f839f3bf81","url":"text/suttas/KN/Dhp/Ch03.txt"},{"revision":"45ee42c1d0f4ee32a15ebed2e910fd10","url":"text/suttas/KN/Dhp/Ch04.txt"},{"revision":"6c7938cb118ddc0ea825d07c5639f59e","url":"text/suttas/KN/Dhp/Ch05.txt"},{"revision":"995f1fd0b1d6769237a3b8a92a2179d5","url":"text/suttas/KN/Dhp/Ch06.txt"},{"revision":"a26e45f4480b7ade574a5922f34a5c49","url":"text/suttas/KN/Dhp/Ch07.txt"},{"revision":"bb9c7fe87fdee36c94e24a9e5d452121","url":"text/suttas/KN/Dhp/Ch08.txt"},{"revision":"06887e38963ceaafbffd39b13b8c30f4","url":"text/suttas/KN/Dhp/Ch09.txt"},{"revision":"f808e8ba9bf853236e0b38a788c7038f","url":"text/suttas/KN/Dhp/Ch10.txt"},{"revision":"2ebcc1e71243eeede2ce565c1d62468e","url":"text/suttas/KN/Dhp/Ch11.txt"},{"revision":"23771f8e51a5f68c1664e44aac578fb0","url":"text/suttas/KN/Dhp/Ch12.txt"},{"revision":"fc6b9ec6a3fa0f05833d7a959fef0669","url":"text/suttas/KN/Dhp/Ch13.txt"},{"revision":"a4f7ce157f2856a8e36a6a5a83a52492","url":"text/suttas/KN/Dhp/Ch14.txt"},{"revision":"0a04947f46d451248b265e3d5ef3cb1e","url":"text/suttas/KN/Dhp/Ch15.txt"},{"revision":"2f5c04ba4e7ba9df0f83610d6010d31c","url":"text/suttas/KN/Dhp/Ch16.txt"},{"revision":"fc0ddfa4cf7a818f02e73a957e97d7ce","url":"text/suttas/KN/Dhp/Ch17.txt"},{"revision":"1976781638c6bc66736189dde9252ca5","url":"text/suttas/KN/Dhp/Ch18.txt"},{"revision":"648eb294cbd239783b202dcd68b64900","url":"text/suttas/KN/Dhp/Ch19.txt"},{"revision":"c1898f368a6764731e9ef032dde9e682","url":"text/suttas/KN/Dhp/Ch20.txt"},{"revision":"6c77825c6244fe5c0a95d9b988be2b59","url":"text/suttas/KN/Dhp/Ch21.txt"},{"revision":"d14b0061b259faf1bc8609dbb6eec592","url":"text/suttas/KN/Dhp/Ch22.txt"},{"revision":"96a034e60f4fd19386aaca2f5b6d6fe5","url":"text/suttas/KN/Dhp/Ch23.txt"},{"revision":"f16a4ab7adab9bfa2330577bb52330d5","url":"text/suttas/KN/Dhp/Ch24.txt"},{"revision":"1728d7b9766d7217ce710183e3e4dab6","url":"text/suttas/KN/Dhp/Ch25.txt"},{"revision":"80d76b14543c2d431ec8ecba1ffbd30d","url":"text/suttas/KN/Dhp/Ch26.txt"},{"revision":"ef6b5c7602e837c6b7f2865572bb0dfc","url":"text/suttas/KN/Iti/iti1.txt"},{"revision":"f95f229d67c864fc5d397def774e4a66","url":"text/suttas/KN/Iti/iti10.txt"},{"revision":"84ca1c22b259a82646e928236dba2f75","url":"text/suttas/KN/Iti/iti100.txt"},{"revision":"93f947ec31041c7feda4990d8493707c","url":"text/suttas/KN/Iti/iti101.txt"},{"revision":"c5d6a112b17617be2104fcff13de9ed0","url":"text/suttas/KN/Iti/iti102.txt"},{"revision":"ea8606870134a7ddc246703c9b7cab6c","url":"text/suttas/KN/Iti/iti103.txt"},{"revision":"d0de70f6d3a010da4db8ecc0674bb079","url":"text/suttas/KN/Iti/iti104.txt"},{"revision":"7304c8968c50fdd6f9bdd06b2195dcc7","url":"text/suttas/KN/Iti/iti105.txt"},{"revision":"9f17fbc8415a9ef4872e982014e3e31c","url":"text/suttas/KN/Iti/iti106.txt"},{"revision":"45a801a79066ef5885d575bd60658e20","url":"text/suttas/KN/Iti/iti107.txt"},{"revision":"1f355118bd6704c91b71901ed475cad3","url":"text/suttas/KN/Iti/iti108.txt"},{"revision":"6b9ce7f4f82435419a171f7a58af55e5","url":"text/suttas/KN/Iti/iti109.txt"},{"revision":"f3290a1f2dcb05fdbf956b99d9c54fd7","url":"text/suttas/KN/Iti/iti110.txt"},{"revision":"6126be07f49369bce557f84ab5d1eb84","url":"text/suttas/KN/Iti/iti111.txt"},{"revision":"55c66f5a61b4ed1c3947708c19ac4e07","url":"text/suttas/KN/Iti/iti112.txt"},{"revision":"1afb1f9764dc919158020e99da1e9f8e","url":"text/suttas/KN/Iti/iti14.txt"},{"revision":"cd3211677391646b37f97cea5e879def","url":"text/suttas/KN/Iti/iti15.txt"},{"revision":"53adf3eb23230e04e4376eebed7aa98a","url":"text/suttas/KN/Iti/iti16.txt"},{"revision":"2512344df3768b1c977fff44fe7360bc","url":"text/suttas/KN/Iti/iti17.txt"},{"revision":"24ef25be468c6ace6760912bff14c5c9","url":"text/suttas/KN/Iti/iti18.txt"},{"revision":"e0adddc385a564f0dbaf8318bb704d74","url":"text/suttas/KN/Iti/iti19.txt"},{"revision":"370916e0af52e6f016761a8f720404dd","url":"text/suttas/KN/Iti/iti2.txt"},{"revision":"f7b78b405c0d458a6f3e8e46a56f128e","url":"text/suttas/KN/Iti/iti20.txt"},{"revision":"0debf2353d9a9aabb168820a8727bfb8","url":"text/suttas/KN/Iti/iti21.txt"},{"revision":"cb51a5f86d3d509914e85fa3e8c2c451","url":"text/suttas/KN/Iti/iti22.txt"},{"revision":"c72d74cdea00110025c855e6d5fd7e4f","url":"text/suttas/KN/Iti/iti23.txt"},{"revision":"3833124a2baafd7c88688e66044f6b3c","url":"text/suttas/KN/Iti/iti24.txt"},{"revision":"750899474605b91f7876b37cf61132b5","url":"text/suttas/KN/Iti/iti25.txt"},{"revision":"e35634aa2c242abd899e7455b782a2b6","url":"text/suttas/KN/Iti/iti26.txt"},{"revision":"f2a6ea2f3e8957a125010f848be04d71","url":"text/suttas/KN/Iti/iti27.txt"},{"revision":"2de097afa239c304281089db46081faa","url":"text/suttas/KN/Iti/iti28.txt"},{"revision":"8295dffa94a4738bf54fff3730f58a2f","url":"text/suttas/KN/Iti/iti29.txt"},{"revision":"690cfe67885bc2bd0b318ef164e64ab0","url":"text/suttas/KN/Iti/iti3.txt"},{"revision":"4856605801003b6df75fc683c2ce86c3","url":"text/suttas/KN/Iti/iti30.txt"},{"revision":"64ab64ea7f3d03686a31d6788323e984","url":"text/suttas/KN/Iti/iti31.txt"},{"revision":"786162d73ca9c5e450444b27f32cda88","url":"text/suttas/KN/Iti/iti32.txt"},{"revision":"b84eca317c5e42a3ca8d2746ab0f2065","url":"text/suttas/KN/Iti/iti33.txt"},{"revision":"db0eb8a42a7d8db5f6dbcbf6735a009a","url":"text/suttas/KN/Iti/iti34.txt"},{"revision":"affb85f56648372f90373879e96e8b65","url":"text/suttas/KN/Iti/iti35.txt"},{"revision":"1088e2594b98227eaba620fed69472d4","url":"text/suttas/KN/Iti/iti36.txt"},{"revision":"fc550673c428bd9a556828353740fbb2","url":"text/suttas/KN/Iti/iti37.txt"},{"revision":"b08fb60358e2513f11c923368e2a13b8","url":"text/suttas/KN/Iti/iti38.txt"},{"revision":"cb96ac18f1aaccffdab1bb4d38e85564","url":"text/suttas/KN/Iti/iti39.txt"},{"revision":"20819cd4bcb0c06cc7f39224dc6d2d21","url":"text/suttas/KN/Iti/iti4.txt"},{"revision":"a266f502dba18191813ad054d4c3f894","url":"text/suttas/KN/Iti/iti40.txt"},{"revision":"bbfde5b159516b7f0cd6c3bf0322d096","url":"text/suttas/KN/Iti/iti41.txt"},{"revision":"0bf28fd01a32e480fdc227de158a3715","url":"text/suttas/KN/Iti/iti42.txt"},{"revision":"fd358da8a9e1f1dfe81864b96c90d0ed","url":"text/suttas/KN/Iti/iti43.txt"},{"revision":"eb5bc15ce895e380aeb02191bc077ecc","url":"text/suttas/KN/Iti/iti44.txt"},{"revision":"41fb2942ac53a6111899cce13f05d6df","url":"text/suttas/KN/Iti/iti45.txt"},{"revision":"5362e0b7735eb5894fc9045f8ef901b7","url":"text/suttas/KN/Iti/iti46.txt"},{"revision":"04429dccaa917d7753ec2b3be4d71189","url":"text/suttas/KN/Iti/iti47.txt"},{"revision":"59229e0456e1d261598d7d32f9563631","url":"text/suttas/KN/Iti/iti48.txt"},{"revision":"4713ae3cea250f554a10440d9c3c145c","url":"text/suttas/KN/Iti/iti49.txt"},{"revision":"15913ba615d21451b90de51dd5000a27","url":"text/suttas/KN/Iti/iti5.txt"},{"revision":"7cfb61a2fc1788044e66a19fa84878de","url":"text/suttas/KN/Iti/iti50.txt"},{"revision":"0947ef377a10a4658cf641a8dc0cd321","url":"text/suttas/KN/Iti/iti51.txt"},{"revision":"ca0e9bdf3be0701be41ce85fa4edbb32","url":"text/suttas/KN/Iti/iti52.txt"},{"revision":"5d05c3407af876a4ae79cf4d14af0969","url":"text/suttas/KN/Iti/iti53.txt"},{"revision":"edf154971359318d9cbd4a7b07d9f696","url":"text/suttas/KN/Iti/iti54.txt"},{"revision":"58a2803340d1cd1390355d76fb0f7bc6","url":"text/suttas/KN/Iti/iti55.txt"},{"revision":"b27d80747084b7f8663d4c6ffe031221","url":"text/suttas/KN/Iti/iti56.txt"},{"revision":"376f15ca169849cff90f2ef3b4a41676","url":"text/suttas/KN/Iti/iti57.txt"},{"revision":"66ac99cb9554fc49ade8f930fb57b1d7","url":"text/suttas/KN/Iti/iti58.txt"},{"revision":"8c9b3309c6669ab766ba4fde1d368a80","url":"text/suttas/KN/Iti/iti59.txt"},{"revision":"2a353d701c753b2443464d84605892f9","url":"text/suttas/KN/Iti/iti6.txt"},{"revision":"d6738c7905c167e849a5bfa4719f2333","url":"text/suttas/KN/Iti/iti60.txt"},{"revision":"d428595a8e0e52a084a0f46574b05c53","url":"text/suttas/KN/Iti/iti61.txt"},{"revision":"7f017d2f4ac93637f8159fd452adb748","url":"text/suttas/KN/Iti/iti62.txt"},{"revision":"19d45455806ba47a9ff38f3885009569","url":"text/suttas/KN/Iti/iti63.txt"},{"revision":"bae29bae881c18e2208032cace466de9","url":"text/suttas/KN/Iti/iti64.txt"},{"revision":"f6d6efd2db7b1df3df7abc0d6cd7410e","url":"text/suttas/KN/Iti/iti65.txt"},{"revision":"3c9c13e74ef55467d9e8cec2a36ce602","url":"text/suttas/KN/Iti/iti66.txt"},{"revision":"df8285d5981dd5d0587fef795dfdf1bf","url":"text/suttas/KN/Iti/iti67.txt"},{"revision":"31d76723629a6ae9f71caf939caea799","url":"text/suttas/KN/Iti/iti68.txt"},{"revision":"bb715acb4bc0c1262336ab058e2e2437","url":"text/suttas/KN/Iti/iti69.txt"},{"revision":"1c51a5bf8cb509c90f38f3384790e8eb","url":"text/suttas/KN/Iti/iti7.txt"},{"revision":"53723cf8bfd4cae650284910b4cf65a7","url":"text/suttas/KN/Iti/iti70.txt"},{"revision":"c66b03d7bc2e36389371c0000b679db5","url":"text/suttas/KN/Iti/iti71.txt"},{"revision":"dfa1816a5b8bd08190825bbbc4bf87bf","url":"text/suttas/KN/Iti/iti72.txt"},{"revision":"62f5a0d4f7bb678b6d65175f0362efda","url":"text/suttas/KN/Iti/iti73.txt"},{"revision":"3106cd9506a2c4d656605f1053639087","url":"text/suttas/KN/Iti/iti74.txt"},{"revision":"aecd1bf4b355eaf75c8233f168aaf237","url":"text/suttas/KN/Iti/iti75.txt"},{"revision":"38a3f5f22c431089c5e50a00e97081d5","url":"text/suttas/KN/Iti/iti76.txt"},{"revision":"67910ea0c4feaea8145eb97a05fa9cf7","url":"text/suttas/KN/Iti/iti77.txt"},{"revision":"56ec42801eb8f5e6d22fe3effcfa750b","url":"text/suttas/KN/Iti/iti78.txt"},{"revision":"f3bd6a724bb32a64963619852a61134d","url":"text/suttas/KN/Iti/iti79.txt"},{"revision":"f6359039b6a600a72bb2ab7941644126","url":"text/suttas/KN/Iti/iti8.txt"},{"revision":"07ac5f1913aff7d2c567190b54142a33","url":"text/suttas/KN/Iti/iti80.txt"},{"revision":"88de861c981f0f92df74c017db409838","url":"text/suttas/KN/Iti/iti81.txt"},{"revision":"8565eed5746dd58656d89e90fefa2141","url":"text/suttas/KN/Iti/iti82.txt"},{"revision":"164ae1192c6bdf2c307134ba371934a7","url":"text/suttas/KN/Iti/iti83.txt"},{"revision":"98812604224179ebd84286f3c9844008","url":"text/suttas/KN/Iti/iti84.txt"},{"revision":"491210ad28b8f31e6b39af2b03de7e6e","url":"text/suttas/KN/Iti/iti85.txt"},{"revision":"59e3fd441502583a3478cf30d6cde592","url":"text/suttas/KN/Iti/iti86.txt"},{"revision":"e1cec8b832337925ded6b91c78bcf09b","url":"text/suttas/KN/Iti/iti87.txt"},{"revision":"9151b45f2961cfe646af93734352f493","url":"text/suttas/KN/Iti/iti88.txt"},{"revision":"5caa3d187e2ab965aad2701c6d9bde48","url":"text/suttas/KN/Iti/iti89.txt"},{"revision":"19033820f878cd9cbec41ce978a6359b","url":"text/suttas/KN/Iti/iti9.txt"},{"revision":"20b1c7db61f54055a677559b9e6b8547","url":"text/suttas/KN/Iti/iti90.txt"},{"revision":"b880eb25f75c742d43b6d7dbe791be36","url":"text/suttas/KN/Iti/iti91.txt"},{"revision":"b89ffef340f2698cb5f6685e7e6eaa05","url":"text/suttas/KN/Iti/iti92.txt"},{"revision":"520eb9be0e14ec566cfe5b7d40b6bd49","url":"text/suttas/KN/Iti/iti93.txt"},{"revision":"ccea6698f48bc684bfc8782506687941","url":"text/suttas/KN/Iti/iti94.txt"},{"revision":"253a28069038c1601e02cb05bc95480a","url":"text/suttas/KN/Iti/iti95.txt"},{"revision":"15ee2856d75dbb48a4754df2991b3c75","url":"text/suttas/KN/Iti/iti96.txt"},{"revision":"f39348a745bb8dbb32bed5fabe29d5c7","url":"text/suttas/KN/Iti/iti97.txt"},{"revision":"d75e1738138d7e5b867c780e71365e2d","url":"text/suttas/KN/Iti/iti98.txt"},{"revision":"c95ab95bc6365a1811c05ade2e2323ed","url":"text/suttas/KN/Iti/iti99.txt"},{"revision":"f2e8f9c7e0a6dba5a2c0047ec720a6c1","url":"text/suttas/KN/Khp/khp1.txt"},{"revision":"87c388dca130eb3c66af6161ca8638ff","url":"text/suttas/KN/Khp/khp2.txt"},{"revision":"95871ca5a728a04e3f9a3a06e64ffbc3","url":"text/suttas/KN/Khp/khp3.txt"},{"revision":"b88d4a45b7bbbfe8012bd00cb5a0b4ab","url":"text/suttas/KN/Khp/khp4.txt"},{"revision":"240129cbcd1f47f0aca97b4aa8876252","url":"text/suttas/KN/Khp/khp5.txt"},{"revision":"415fe59134ad438f35f97f14fbb4dc81","url":"text/suttas/KN/Khp/khp6.txt"},{"revision":"467122797a42eaef1eed655f23c3255d","url":"text/suttas/KN/Khp/khp7.txt"},{"revision":"0289162542bca060e5dcf6c3a03e0a42","url":"text/suttas/KN/Khp/khp8.txt"},{"revision":"da9349fa3d7383f9a43b028c78dc3bba","url":"text/suttas/KN/Khp/khp9.txt"},{"revision":"aa3893587adbfe8f186ea8338d9a49a2","url":"text/suttas/KN/StNp/StNp1_1.txt"},{"revision":"d4c679c9f4f3c3a3cbc37600f1cdd113","url":"text/suttas/KN/StNp/StNp1_10.txt"},{"revision":"11037e7c7d4fac05348f585eb10c2d32","url":"text/suttas/KN/StNp/StNp1_11.txt"},{"revision":"a8e4ed10b38fd013dd28f13c8872a0fb","url":"text/suttas/KN/StNp/StNp1_12.txt"},{"revision":"f6c81c89dc2a2422e89ccc80d9460f5b","url":"text/suttas/KN/StNp/StNp1_2.txt"},{"revision":"a0372e3896d964d29e520547ba686abb","url":"text/suttas/KN/StNp/StNp1_3.txt"},{"revision":"95de68f2e8dbb81a768b30b291e3d3b5","url":"text/suttas/KN/StNp/StNp1_4.txt"},{"revision":"efa6fe4f96a26c98925f78f4d79d1c1f","url":"text/suttas/KN/StNp/StNp1_5.txt"},{"revision":"ca35cdefbd5e375e40f39b63cdf1719e","url":"text/suttas/KN/StNp/StNp1_6.txt"},{"revision":"d9b65275dcc97399d508d5b091013b1c","url":"text/suttas/KN/StNp/StNp1_7.txt"},{"revision":"14153d4dd9c6c7794312e2d750e287b2","url":"text/suttas/KN/StNp/StNp1_8.txt"},{"revision":"fd2ae632bbebe532fcfb5d0207111226","url":"text/suttas/KN/StNp/StNp1_9.txt"},{"revision":"0fa38a694b91bdef1e6b45faae1d33a5","url":"text/suttas/KN/StNp/StNp2_1.txt"},{"revision":"4669827600ad7591943ecae52eb0e728","url":"text/suttas/KN/StNp/StNp2_10.txt"},{"revision":"c760604387110437a70b9049ce2211be","url":"text/suttas/KN/StNp/StNp2_11.txt"},{"revision":"1bcd8a3634463be94c747b704f666e97","url":"text/suttas/KN/StNp/StNp2_12.txt"},{"revision":"72a44642173ebc041649a2a56578fc84","url":"text/suttas/KN/StNp/StNp2_13.txt"},{"revision":"e44dcece70bed61e366afed6a121b20a","url":"text/suttas/KN/StNp/StNp2_14.txt"},{"revision":"30e020677c30ffb10f26a0700417ff3a","url":"text/suttas/KN/StNp/StNp2_2.txt"},{"revision":"c6d3ade0899121af90c3caf474c35ba4","url":"text/suttas/KN/StNp/StNp2_3.txt"},{"revision":"41d920aebb7497f18b77d440d0d3f60e","url":"text/suttas/KN/StNp/StNp2_4.txt"},{"revision":"928cfee1e1d66e2ae8fbfd9721e2e79b","url":"text/suttas/KN/StNp/StNp2_5.txt"},{"revision":"4696e63003ee76748aa3506c0f84a960","url":"text/suttas/KN/StNp/StNp2_6.txt"},{"revision":"e4b8d46a40c5fc936e01c9c3b8a5896c","url":"text/suttas/KN/StNp/StNp2_7.txt"},{"revision":"243a017b6ebdc4a1f2c7b4a4fd933c04","url":"text/suttas/KN/StNp/StNp2_8.txt"},{"revision":"5f4e8fa641ffc04046d61c9bcfb8d14a","url":"text/suttas/KN/StNp/StNp2_9.txt"},{"revision":"3d0f338a54809ed803c955e1397f9b0c","url":"text/suttas/KN/StNp/StNp3_1.txt"},{"revision":"74bfdb4abe1c4ea4fd6276e778d494fc","url":"text/suttas/KN/StNp/StNp3_10.txt"},{"revision":"f5fffed2ffe517f206e9bf9c5644c1a3","url":"text/suttas/KN/StNp/StNp3_11.txt"},{"revision":"bcaf68ae87dbf02b4f85c72aaf3bc718","url":"text/suttas/KN/StNp/StNp3_12.txt"},{"revision":"946a6ae66f988f97ccf727c036782cbc","url":"text/suttas/KN/StNp/StNp3_2.txt"},{"revision":"e6b1a19b8542b3df8965f081a48ba61f","url":"text/suttas/KN/StNp/StNp3_3.txt"},{"revision":"27edf45c559a477cc727b561aef76d27","url":"text/suttas/KN/StNp/StNp3_4.txt"},{"revision":"906af459d2afba49ef55a3a8eb9ed2f6","url":"text/suttas/KN/StNp/StNp3_5.txt"},{"revision":"804f0fab79c05d2066d4de6a4d0456f4","url":"text/suttas/KN/StNp/StNp3_6.txt"},{"revision":"e6ed506aa73a5997e8bad535b521a7f3","url":"text/suttas/KN/StNp/StNp3_7.txt"},{"revision":"baa820efa1cd5455be41a8b63d6d7231","url":"text/suttas/KN/StNp/StNp3_8.txt"},{"revision":"cd4d1aae3027c508faa7e9bc6fa18ae8","url":"text/suttas/KN/StNp/StNp3_9.txt"},{"revision":"ba371eee9390c876f312116369e8bcf9","url":"text/suttas/KN/StNp/StNp4_1.txt"},{"revision":"b8899878a7ceef741a6a0167d63f7de0","url":"text/suttas/KN/StNp/StNp4_10.txt"},{"revision":"1db713b8b6cf8992b76fa60e4e976675","url":"text/suttas/KN/StNp/StNp4_11.txt"},{"revision":"d46cc1c0e4dcf1d5ffe6133d2e93a99b","url":"text/suttas/KN/StNp/StNp4_12.txt"},{"revision":"f6fbe450ad75258ffb57a6bb8e699dfe","url":"text/suttas/KN/StNp/StNp4_13.txt"},{"revision":"d15f96927eb598a20de9099d4f3a2d32","url":"text/suttas/KN/StNp/StNp4_14.txt"},{"revision":"1af7478681aa399af5477af82e9fed7d","url":"text/suttas/KN/StNp/StNp4_15.txt"},{"revision":"aa08297664de01138fe3026a62ff90a6","url":"text/suttas/KN/StNp/StNp4_16.txt"},{"revision":"2fa3ef5d07a94afea0d0bb97492c786a","url":"text/suttas/KN/StNp/StNp4_2.txt"},{"revision":"1fef61f84ecba1e7db77b0afc47469fa","url":"text/suttas/KN/StNp/StNp4_3.txt"},{"revision":"d890de073aab1805514498fdfa2609f3","url":"text/suttas/KN/StNp/StNp4_4.txt"},{"revision":"bea2c2ec659fbea6739826cf874dc1a2","url":"text/suttas/KN/StNp/StNp4_5.txt"},{"revision":"23f35769301edce8ff4c37fdac1c490e","url":"text/suttas/KN/StNp/StNp4_6.txt"},{"revision":"af224fb6cb87efe73967528b1c80aaba","url":"text/suttas/KN/StNp/StNp4_7.txt"},{"revision":"9754ec42739a689eca60e0bc055bea30","url":"text/suttas/KN/StNp/StNp4_8.txt"},{"revision":"05acc732fc02ffc96a6e659ecaeee6b9","url":"text/suttas/KN/StNp/StNp4_9.txt"},{"revision":"cc5c26440f04122b4e17a3365ace1859","url":"text/suttas/KN/StNp/StNp5_1.txt"},{"revision":"0631c20a02d99529ccb37d9836fd1c14","url":"text/suttas/KN/StNp/StNp5_10.txt"},{"revision":"6c22858d12cdc9585c5c7174fd536085","url":"text/suttas/KN/StNp/StNp5_11.txt"},{"revision":"b123f7dd3c977271bfa51c069d5ae1b4","url":"text/suttas/KN/StNp/StNp5_12.txt"},{"revision":"05e5a627c605e976cec9fe895f0f58fd","url":"text/suttas/KN/StNp/StNp5_13.txt"},{"revision":"66515d71c70dbf5cbeb663137f2e099f","url":"text/suttas/KN/StNp/StNp5_14.txt"},{"revision":"3cdf2b81f687170ecad1057785d9b175","url":"text/suttas/KN/StNp/StNp5_15.txt"},{"revision":"70d9107158ed0abc32d21c86b24ab48d","url":"text/suttas/KN/StNp/StNp5_16.txt"},{"revision":"54427f770805f41476ef2bd252d6c60e","url":"text/suttas/KN/StNp/StNp5_2.txt"},{"revision":"1d9c01a41ecff7bfdb8c9e0d3c33b4c6","url":"text/suttas/KN/StNp/StNp5_3.txt"},{"revision":"69e73cfc2ebf252d429d3e356866d846","url":"text/suttas/KN/StNp/StNp5_4.txt"},{"revision":"5d2076d8fcbb6334d69b885f0bf77b57","url":"text/suttas/KN/StNp/StNp5_5.txt"},{"revision":"16ad9736be6f51fb87ae048bc7e19324","url":"text/suttas/KN/StNp/StNp5_6.txt"},{"revision":"4e1be9ff42bf7241bc95387c8b6ad7a9","url":"text/suttas/KN/StNp/StNp5_7.txt"},{"revision":"c3beed03ff423ac42d3c3a1e43f62ac4","url":"text/suttas/KN/StNp/StNp5_8.txt"},{"revision":"cb84ec5349bb7342fa974acb57a06042","url":"text/suttas/KN/StNp/StNp5_9.txt"},{"revision":"7772b0c7d77438197be1fff38a4358c7","url":"text/suttas/KN/StNp/StNp5_epilog.txt"},{"revision":"88e81a7db713012dbdce1cfe49f40c71","url":"text/suttas/KN/StNp/StNp5_prolog.txt"},{"revision":"cf6962138d29c34e6052eeaba5a01008","url":"text/suttas/KN/Thag/thag1_1.txt"},{"revision":"92610643beed4a79be4b0f700ffe908c","url":"text/suttas/KN/Thag/thag1_10.txt"},{"revision":"0279f0f6afb9feac92ba374c0caee2e6","url":"text/suttas/KN/Thag/thag1_100.txt"},{"revision":"9936c70ae0761006edaaa56ef4970607","url":"text/suttas/KN/Thag/thag1_101.txt"},{"revision":"b811fc3eea73bbf7bf7dacdbedfe33f1","url":"text/suttas/KN/Thag/thag1_104.txt"},{"revision":"ee293a8041a3f64b7e8932b2e21a2004","url":"text/suttas/KN/Thag/thag1_109.txt"},{"revision":"40e8e0271ff365dcb09cc345109975f6","url":"text/suttas/KN/Thag/thag1_110.txt"},{"revision":"7dd676b70f60c0f08b50958f96b5b1de","url":"text/suttas/KN/Thag/thag1_111.txt"},{"revision":"e861ad8fdfb680f35815953dec6ec592","url":"text/suttas/KN/Thag/thag1_113.txt"},{"revision":"2df3e2f78cb3d56f1f30cbfb6adda57e","url":"text/suttas/KN/Thag/thag1_114.txt"},{"revision":"282a62497b11e3471d95e75a2cedd6ff","url":"text/suttas/KN/Thag/thag1_118.txt"},{"revision":"24527e68f4ca8c74af38b54865c514c3","url":"text/suttas/KN/Thag/thag1_119.txt"},{"revision":"9a56be4b2a36b8c994895714c9a565f2","url":"text/suttas/KN/Thag/thag1_120.txt"},{"revision":"4858e53a8d103e74301ad1d33f1697cf","url":"text/suttas/KN/Thag/thag1_13.txt"},{"revision":"f078c5adc711ffcf41b8438898751053","url":"text/suttas/KN/Thag/thag1_14.txt"},{"revision":"75b5a2c32d1d1f013e5a9fb765407b52","url":"text/suttas/KN/Thag/thag1_16.txt"},{"revision":"7272c32c38c76f7da2999f6c06507c4d","url":"text/suttas/KN/Thag/thag1_18.txt"},{"revision":"27d64bbc06c536ebb304c67dc3b99095","url":"text/suttas/KN/Thag/thag1_2.txt"},{"revision":"63ac4b9656d003076c09340169d0e3cf","url":"text/suttas/KN/Thag/thag1_21.txt"},{"revision":"7e3bc17c94f9b93075fb1beb0f084a6c","url":"text/suttas/KN/Thag/thag1_22.txt"},{"revision":"e04befae2f0649797ac80481db88cf0f","url":"text/suttas/KN/Thag/thag1_23.txt"},{"revision":"738329643923f08a92cf128950fadd94","url":"text/suttas/KN/Thag/thag1_25.txt"},{"revision":"7222ffe7cbf1c02a38291922726219d5","url":"text/suttas/KN/Thag/thag1_26.txt"},{"revision":"1f2ad20086484f233c7964130bebd2c7","url":"text/suttas/KN/Thag/thag1_29.txt"},{"revision":"2c6144e19d7f53667a2a42a9d5edc4f8","url":"text/suttas/KN/Thag/thag1_3.txt"},{"revision":"c80ae1c08eaff37e5e5b8b8dd2a3dced","url":"text/suttas/KN/Thag/thag1_31.txt"},{"revision":"b51d1f9e4b4d2ae3da29e13efde22e8c","url":"text/suttas/KN/Thag/thag1_32.txt"},{"revision":"f48051cf91bcf808c72a98a3a5985df6","url":"text/suttas/KN/Thag/thag1_33.txt"},{"revision":"38fe12256e15a08c7bf2aaf111996c6b","url":"text/suttas/KN/Thag/thag1_39.txt"},{"revision":"83f47485bfc8995fc1fb058db07415fa","url":"text/suttas/KN/Thag/thag1_41.txt"},{"revision":"61cd315e01c070062d8799d9ea125174","url":"text/suttas/KN/Thag/thag1_43.txt"},{"revision":"3b7d07195a6a5260681ad6ce9b7de348","url":"text/suttas/KN/Thag/thag1_49.txt"},{"revision":"f51699684b3cf1a676a3c11b56f4ddc3","url":"text/suttas/KN/Thag/thag1_50.txt"},{"revision":"9e82a3114ddfd85bda405a41bf4da274","url":"text/suttas/KN/Thag/thag1_56.txt"},{"revision":"ffe6ff8ca5f3727e354c83c2b331272a","url":"text/suttas/KN/Thag/thag1_57.txt"},{"revision":"c8ccc84d317d398566885dd341efe7b4","url":"text/suttas/KN/Thag/thag1_6.txt"},{"revision":"15aa9ed4acaf6a518b2dc3402d7d8df2","url":"text/suttas/KN/Thag/thag1_61.txt"},{"revision":"876322ecb7ca108855132a592d661648","url":"text/suttas/KN/Thag/thag1_68.txt"},{"revision":"b9f7a5875b53d879a79726d30e4e6383","url":"text/suttas/KN/Thag/thag1_7.txt"},{"revision":"34a85be352f2ac45750ab4476a6efc61","url":"text/suttas/KN/Thag/thag1_73.txt"},{"revision":"be0450dc61af89794545f2efc284250a","url":"text/suttas/KN/Thag/thag1_75.txt"},{"revision":"d30cb378f2a9ff06da830ff9c1d96e76","url":"text/suttas/KN/Thag/thag1_84.txt"},{"revision":"9fd6e3bde39ed0dcdbe75d292f93a9e7","url":"text/suttas/KN/Thag/thag1_85.txt"},{"revision":"3b92230a54343571a0f1e5e3cfda7fc8","url":"text/suttas/KN/Thag/thag1_86.txt"},{"revision":"aea7b3316c16735b26f35c8dffe134e1","url":"text/suttas/KN/Thag/thag1_88.txt"},{"revision":"dfba0b988a7a10e927914833165c143e","url":"text/suttas/KN/Thag/thag1_93.txt"},{"revision":"abdcd529783a8e99282397251af37243","url":"text/suttas/KN/Thag/thag1_95.txt"},{"revision":"9d85ba74b0d92977c4bb7b7bbdb6f283","url":"text/suttas/KN/Thag/thag10_1.txt"},{"revision":"e472387776ff9418db2f2c1e82d4e3ee","url":"text/suttas/KN/Thag/thag10_2.txt"},{"revision":"2de5d9f81c44f48ed1ce4654b1c12854","url":"text/suttas/KN/Thag/thag10_5.txt"},{"revision":"2502b4261973dd2c7d1676c11907a210","url":"text/suttas/KN/Thag/thag10_7.txt"},{"revision":"34eb8b07fa17e1066ec08eaccb53bc37","url":"text/suttas/KN/Thag/thag11.txt"},{"revision":"39e8801ebebedc4479aa19d4a86ad242","url":"text/suttas/KN/Thag/thag12_1.txt"},{"revision":"caf32eeca4a3d4f67e2a4087f26b0ea4","url":"text/suttas/KN/Thag/thag12_2.txt"},{"revision":"c6271c4f4fbe91d18c966df0a895e83e","url":"text/suttas/KN/Thag/thag13.txt"},{"revision":"6e1a24476ec927ca02b67c13858c20ee","url":"text/suttas/KN/Thag/thag14_1.txt"},{"revision":"b2c76101991ca4bc311b1d92fac1d41c","url":"text/suttas/KN/Thag/thag14_2.txt"},{"revision":"e658438c808f0b5ede392c034ca87e21","url":"text/suttas/KN/Thag/thag15_2.txt"},{"revision":"fb1f3b63f8a80f1a3e7fd450e98f96a7","url":"text/suttas/KN/Thag/thag16_1.txt"},{"revision":"7a955563df59b712624d33645022d575","url":"text/suttas/KN/Thag/thag16_4.txt"},{"revision":"5aa888bf07a51299a38b064124442134","url":"text/suttas/KN/Thag/thag16_7.txt"},{"revision":"de41fb6e8eb80de46b7bf3a6ef8b8f6a","url":"text/suttas/KN/Thag/thag16_8.txt"},{"revision":"5d33ebb86197f23e9da64a1a4e4d5508","url":"text/suttas/KN/Thag/thag17_2.txt"},{"revision":"fff23d525780855f23dd03f4dc8c2bfa","url":"text/suttas/KN/Thag/thag18.txt"},{"revision":"41f2ac94219606ab4caf2b1194f0d8b5","url":"text/suttas/KN/Thag/thag2_11.txt"},{"revision":"43d82c41d39f6cb78d3719e201c2eab3","url":"text/suttas/KN/Thag/thag2_13.txt"},{"revision":"24558c01c79e0e0bb81bc771f2cce366","url":"text/suttas/KN/Thag/thag2_16.txt"},{"revision":"7e992b2592f1ccf4f5ec0b64481ab205","url":"text/suttas/KN/Thag/thag2_24.txt"},{"revision":"a100975ea496dde9cc68537d1f17880c","url":"text/suttas/KN/Thag/thag2_26.txt"},{"revision":"3b61c30a30703ea7ba407db3aa100f8f","url":"text/suttas/KN/Thag/thag2_27.txt"},{"revision":"a6aeaa08220dcb7530803e1f4bd27289","url":"text/suttas/KN/Thag/thag2_3.txt"},{"revision":"5b99e6c16f502821f3268b5f794dd658","url":"text/suttas/KN/Thag/thag2_30.txt"},{"revision":"7ac9f3576affdc2bc2c66f8980b58637","url":"text/suttas/KN/Thag/thag2_32.txt"},{"revision":"bed914e92da7a4e50099fd9674c6d756","url":"text/suttas/KN/Thag/thag2_36.txt"},{"revision":"3c11468fb08b46c2ec033a364969c29e","url":"text/suttas/KN/Thag/thag2_37.txt"},{"revision":"1cff04588da986c394c253a57524672d","url":"text/suttas/KN/Thag/thag2_47.txt"},{"revision":"c8557b71a9e4ad7604f3d151ab29c708","url":"text/suttas/KN/Thag/thag2_9.txt"},{"revision":"c4e6ddbd4393f6dcc840a94296032212","url":"text/suttas/KN/Thag/thag3_13.txt"},{"revision":"03a92526f9893080bab7b8d6be8c3371","url":"text/suttas/KN/Thag/thag3_14.txt"},{"revision":"dfa59ec0fcf38e65da00b0060693970f","url":"text/suttas/KN/Thag/thag3_15.txt"},{"revision":"3c1fa7939ed7f035e4b901495f3388d9","url":"text/suttas/KN/Thag/thag3_5.txt"},{"revision":"2f08093820c9d9e6fedbfcea94025cea","url":"text/suttas/KN/Thag/thag3_8.txt"},{"revision":"61345365358db724d55a2729c66a1aee","url":"text/suttas/KN/Thag/thag4_10.txt"},{"revision":"ceeaf7e973df24360d09f5c08f3f295a","url":"text/suttas/KN/Thag/thag4_8.txt"},{"revision":"08558ba77ebd39a10464c1e07e22299f","url":"text/suttas/KN/Thag/thag5_1.txt"},{"revision":"3d0add4102c4834a8f0ecee4f9879347","url":"text/suttas/KN/Thag/thag5_10.txt"},{"revision":"16c9b8b6c32e869c9faae96746184ea9","url":"text/suttas/KN/Thag/thag5_8.txt"},{"revision":"98f7c0d6ffb08d2542d41277de6f564d","url":"text/suttas/KN/Thag/thag6_10.txt"},{"revision":"49a9661caa4fe80fe81c740a622872c5","url":"text/suttas/KN/Thag/thag6_12.txt"},{"revision":"1ee57ee95d22aa3299889dc0ae8f66a0","url":"text/suttas/KN/Thag/thag6_13.txt"},{"revision":"388b870d63491e4adcb889cafdf9c299","url":"text/suttas/KN/Thag/thag6_2.txt"},{"revision":"f27793a87c8d59f6b8b32d68abb393d8","url":"text/suttas/KN/Thag/thag6_3.txt"},{"revision":"5512fe8651b3a8de788bfb28a19dfab4","url":"text/suttas/KN/Thag/thag6_5.txt"},{"revision":"bd754d8d3d6f5b7cafc446c7c4504270","url":"text/suttas/KN/Thag/thag6_6.txt"},{"revision":"da6ee79813dd909b776e1b717c726ba9","url":"text/suttas/KN/Thag/thag6_9.txt"},{"revision":"54c85a7bf15ab9994569500e5bcbdb7b","url":"text/suttas/KN/Thag/thag7_1.txt"},{"revision":"ed4e250f69e830366217bdfbed23da1a","url":"text/suttas/KN/Thag/thag9.txt"},{"revision":"cbac9bf6c32d5a49e68d7028d3b42e99","url":"text/suttas/KN/Thig/thig1_1.txt"},{"revision":"fda4bdd4cae0427138fe895fa0a9a55d","url":"text/suttas/KN/Thig/thig1_11.txt"},{"revision":"dec4c312477056430cf1feb66f1d5ba6","url":"text/suttas/KN/Thig/thig1_17.txt"},{"revision":"a6dc0d26258ae0f1b2b6215b14d1fd70","url":"text/suttas/KN/Thig/thig1_3.txt"},{"revision":"bd5edb092b19d8a7aa9bc2b615a65821","url":"text/suttas/KN/Thig/thig10.txt"},{"revision":"24100b25ccfff1050a8a3491cdfb9a94","url":"text/suttas/KN/Thig/thig12.txt"},{"revision":"6af5bfe58e1edfb3db4a357ae028c94a","url":"text/suttas/KN/Thig/thig13_1.txt"},{"revision":"7d959b51379842a7e3057c2acb1c35d1","url":"text/suttas/KN/Thig/thig13_2.txt"},{"revision":"502bd576d9abb90320dd825b189724a3","url":"text/suttas/KN/Thig/thig13_5.txt"},{"revision":"59d00b3b5111090afb4468620379c9f0","url":"text/suttas/KN/Thig/thig14.txt"},{"revision":"6edbef8b938b467daa612d5a3134a43d","url":"text/suttas/KN/Thig/thig2_3.txt"},{"revision":"f8d59b9953c25b027f84cf790b200d14","url":"text/suttas/KN/Thig/thig2_4.txt"},{"revision":"dd8e85f239a95a4a1229eae7983b232c","url":"text/suttas/KN/Thig/thig3_2.txt"},{"revision":"71dc385b186663f717e128e1d4fbea5c","url":"text/suttas/KN/Thig/thig3_4.txt"},{"revision":"41696928e7e509e133ca957953b33b4d","url":"text/suttas/KN/Thig/thig3_5.txt"},{"revision":"fc46abebe292797e75f86b6693e51177","url":"text/suttas/KN/Thig/thig5_10.txt"},{"revision":"3511d09676b7553b35b4221fab370152","url":"text/suttas/KN/Thig/thig5_11.txt"},{"revision":"0a77dec5a4e32ea7f173c4b945d85471","url":"text/suttas/KN/Thig/thig5_12.txt"},{"revision":"a1a36d4843db354b5cd5f69529a47211","url":"text/suttas/KN/Thig/thig5_2.txt"},{"revision":"6e3a2ecf8963278267e8c7847513c7b6","url":"text/suttas/KN/Thig/thig5_4.txt"},{"revision":"552703c5b6bbe783efefaf280781a11c","url":"text/suttas/KN/Thig/thig5_6.txt"},{"revision":"8dc98d1657e3c8ca0acbdb60f06e65cf","url":"text/suttas/KN/Thig/thig5_8.txt"},{"revision":"2d44c8c7f8199c1ff5c2a0ce0f703623","url":"text/suttas/KN/Thig/thig6_1.txt"},{"revision":"60a3d3cbc46a0589f931099093648d95","url":"text/suttas/KN/Thig/thig6_2.txt"},{"revision":"5bc07ed23020d9c3773ffb7b56a4e667","url":"text/suttas/KN/Thig/thig6_3.txt"},{"revision":"f23ca6be799408d4ca1c3c95bb52d03f","url":"text/suttas/KN/Thig/thig6_4.txt"},{"revision":"d5f6d10715d51769c50a351a8e62154a","url":"text/suttas/KN/Thig/thig6_5.txt"},{"revision":"dafd34b7ba85d3c259d1c92d774f1692","url":"text/suttas/KN/Thig/thig6_6.txt"},{"revision":"99f0959680c56039f0ef5c305e3c2df8","url":"text/suttas/KN/Thig/thig6_7.txt"},{"revision":"a2b60acf4924196069160af56d11c776","url":"text/suttas/KN/Thig/thig6_8.txt"},{"revision":"0030e4c320aaf61172a5222bbef45afc","url":"text/suttas/KN/Thig/thig7_2.txt"},{"revision":"1b9aa526d20a9ac9c9d102289f2f3f18","url":"text/suttas/KN/Thig/thig7_3.txt"},{"revision":"df74ae52665a620569be6549d83acfd2","url":"text/suttas/KN/Thig/thig8.txt"},{"revision":"7107c951171ef039b9c1744f841e076e","url":"text/suttas/KN/Thig/thig9.txt"},{"revision":"9f2b409a2b00cbfef1616f4f106460eb","url":"text/suttas/KN/Ud/apptwo.txt"},{"revision":"ee2ec43e7d2f98ad2a088b4b6b4772e9","url":"text/suttas/KN/Ud/ud1_1.txt"},{"revision":"1187974108f742a772732a5e5efae96e","url":"text/suttas/KN/Ud/ud1_10.txt"},{"revision":"c18bc1178426e4eca8309c3a57b46d6d","url":"text/suttas/KN/Ud/ud1_2.txt"},{"revision":"74914b5e9e448e9ea8dff7d996bbf408","url":"text/suttas/KN/Ud/ud1_3.txt"},{"revision":"17eb7f616b5df076ef581ce2d8e30634","url":"text/suttas/KN/Ud/ud1_4.txt"},{"revision":"61772fee4d0214b002ff25aa7949a92a","url":"text/suttas/KN/Ud/ud1_5.txt"},{"revision":"3d28d5c7f2eff105abd70e2f2347c02c","url":"text/suttas/KN/Ud/ud1_6.txt"},{"revision":"f546a34369c54a986bf5616ade23ac2c","url":"text/suttas/KN/Ud/ud1_7.txt"},{"revision":"4467948c6984681f0643794398e29df2","url":"text/suttas/KN/Ud/ud1_8.txt"},{"revision":"16ad6faf0b686595b4728e74e5d46342","url":"text/suttas/KN/Ud/ud1_9.txt"},{"revision":"cb16a7c6a91863efbd81ed0d491809de","url":"text/suttas/KN/Ud/ud2_1.txt"},{"revision":"0425457437536f7879c2f76e8be02b3a","url":"text/suttas/KN/Ud/ud2_10.txt"},{"revision":"07a13a50ec047d43550f5c2d803d7f0e","url":"text/suttas/KN/Ud/ud2_2.txt"},{"revision":"40707e3c59cb478e4e07e6b34764b85a","url":"text/suttas/KN/Ud/ud2_3.txt"},{"revision":"6720eb1ebda8a69659c619cca77913a4","url":"text/suttas/KN/Ud/ud2_4.txt"},{"revision":"7a748ef9c9116395f7a55167134ae841","url":"text/suttas/KN/Ud/ud2_5.txt"},{"revision":"3a35e3415969ffdde00eaaa0c5693b86","url":"text/suttas/KN/Ud/ud2_6.txt"},{"revision":"0bee485aa2e0ecf2a583f51df3e433ae","url":"text/suttas/KN/Ud/ud2_7.txt"},{"revision":"c0a4af1884018ae96f2df00133d9aef9","url":"text/suttas/KN/Ud/ud2_8.txt"},{"revision":"1f77ff7bd75ee6cf915322d81725268f","url":"text/suttas/KN/Ud/ud2_9.txt"},{"revision":"76c1a7ce9ad3569cf74d68429d628fa1","url":"text/suttas/KN/Ud/ud3_1.txt"},{"revision":"8820f0c10139d3acaa9324ba9eb54fdf","url":"text/suttas/KN/Ud/ud3_10.txt"},{"revision":"ee587152f15a67281819d3e0f719cbbe","url":"text/suttas/KN/Ud/ud3_2.txt"},{"revision":"1fbf1f9dc12ba20f9bb90f7e28ae167d","url":"text/suttas/KN/Ud/ud3_3.txt"},{"revision":"57bff2c311eb6d35e24499a4e9f4ec0f","url":"text/suttas/KN/Ud/ud3_4.txt"},{"revision":"09ee7357f21175221610b5448b23319f","url":"text/suttas/KN/Ud/ud3_5.txt"},{"revision":"408915c4e86cb060a6598d034fcb16a7","url":"text/suttas/KN/Ud/ud3_6.txt"},{"revision":"60cf0f0bacccacfc0a3623fa674d7310","url":"text/suttas/KN/Ud/ud3_7.txt"},{"revision":"38752c8436a83bf06a7a8939ef71933a","url":"text/suttas/KN/Ud/ud3_8.txt"},{"revision":"0e2ad6a84c35578ff861e5e51a3058a0","url":"text/suttas/KN/Ud/ud3_9.txt"},{"revision":"fba223104acd65785670be953873769f","url":"text/suttas/KN/Ud/ud4_1.txt"},{"revision":"b54b7436afc83a9b5d73dcdd051f87bd","url":"text/suttas/KN/Ud/ud4_10.txt"},{"revision":"0c1d1e34c6c415a647317cc32ac14d3c","url":"text/suttas/KN/Ud/ud4_2.txt"},{"revision":"f35e03c07f2bde81ee8382ed0a5b2680","url":"text/suttas/KN/Ud/ud4_3.txt"},{"revision":"1f5424f21ac103fa331cde6e7ea00cf9","url":"text/suttas/KN/Ud/ud4_4.txt"},{"revision":"12ab0eb9983ba3265c2e241e8838faea","url":"text/suttas/KN/Ud/ud4_5.txt"},{"revision":"ccc599be13de96d5a56b0709afe0c8da","url":"text/suttas/KN/Ud/ud4_6.txt"},{"revision":"4e10ce2baedfdb51d851d54a70981ecf","url":"text/suttas/KN/Ud/ud4_7.txt"},{"revision":"0fad02874ccad2e2f5cdbbfdf34a9e0a","url":"text/suttas/KN/Ud/ud4_8.txt"},{"revision":"fe1e58ad7358a0e617c9dddd3c9f7ee5","url":"text/suttas/KN/Ud/ud4_9.txt"},{"revision":"68363857a50bc400f41dc4f25f196775","url":"text/suttas/KN/Ud/ud5_1.txt"},{"revision":"57eff1358f69e6f6b88b86d31aa0247c","url":"text/suttas/KN/Ud/ud5_10.txt"},{"revision":"d6339b9cdd30260f2e0816b7aebf8466","url":"text/suttas/KN/Ud/ud5_2.txt"},{"revision":"49a92aa09b72496b3531c71e389b4c50","url":"text/suttas/KN/Ud/ud5_3.txt"},{"revision":"b64c5fe3b6268bd4c77e0f1b90240e90","url":"text/suttas/KN/Ud/ud5_4.txt"},{"revision":"7b7c9f8a7d5b205ab3fd4e2fe2ea07e5","url":"text/suttas/KN/Ud/ud5_5.txt"},{"revision":"b4d9933605c05f25d4f88d2e19b31649","url":"text/suttas/KN/Ud/ud5_6.txt"},{"revision":"4647897e7c95762e2b469d47e8521a0f","url":"text/suttas/KN/Ud/ud5_7.txt"},{"revision":"b01cb0f0421f12b73883e73db9f15d05","url":"text/suttas/KN/Ud/ud5_8.txt"},{"revision":"d0964895615a9d2db2d45a5ba6805d83","url":"text/suttas/KN/Ud/ud5_9.txt"},{"revision":"077f66bf8271bd0e4c39c3d6ae6db15a","url":"text/suttas/KN/Ud/ud6_1.txt"},{"revision":"8d660bc8132cc32afdc22ae0522d1678","url":"text/suttas/KN/Ud/ud6_10.txt"},{"revision":"042762bbc444cca12e00647c956210cb","url":"text/suttas/KN/Ud/ud6_2.txt"},{"revision":"ec83916a6ba46cc10a54e889b505d3d2","url":"text/suttas/KN/Ud/ud6_3.txt"},{"revision":"0e51f9bf28ee1586487f4d532bcdff26","url":"text/suttas/KN/Ud/ud6_4.txt"},{"revision":"634f2e724f22f6b12adf143cee72035e","url":"text/suttas/KN/Ud/ud6_5.txt"},{"revision":"bfb922f9157c65990974e74d782067b4","url":"text/suttas/KN/Ud/ud6_6.txt"},{"revision":"cc5e2870ffc1abef2cbf877874e61827","url":"text/suttas/KN/Ud/ud6_7.txt"},{"revision":"1c2fcf5f242f164fd82b58373d436993","url":"text/suttas/KN/Ud/ud6_8.txt"},{"revision":"8cc5a16be06626ca14853ebd8b0e7b60","url":"text/suttas/KN/Ud/ud6_9.txt"},{"revision":"31af496eced9117cde48a599c81f1a92","url":"text/suttas/KN/Ud/ud7_1.txt"},{"revision":"8594cd7cbf08e963151a14701e3ddf36","url":"text/suttas/KN/Ud/ud7_10.txt"},{"revision":"faa014222bb4bc94a539dbb5177cbcb7","url":"text/suttas/KN/Ud/ud7_2.txt"},{"revision":"cb8275239e8e241cd8f03666e276fb25","url":"text/suttas/KN/Ud/ud7_3.txt"},{"revision":"f34083d3c9c823cdf9457fbf4214ccc3","url":"text/suttas/KN/Ud/ud7_4.txt"},{"revision":"75f166e6bf259d28fbb5428a1a717f3f","url":"text/suttas/KN/Ud/ud7_5.txt"},{"revision":"fed91d488fda3aa04178e67a21eeb10a","url":"text/suttas/KN/Ud/ud7_6.txt"},{"revision":"1aa1fc1e0bf347f4407352081c84c6a7","url":"text/suttas/KN/Ud/ud7_7.txt"},{"revision":"9e60729f14a7325227c5393c67686331","url":"text/suttas/KN/Ud/ud7_8.txt"},{"revision":"07e9df55242a48aa90634189eb2c9741","url":"text/suttas/KN/Ud/ud7_9.txt"},{"revision":"760569782dc7fa9668283b984a8ae404","url":"text/suttas/KN/Ud/ud8_1.txt"},{"revision":"9396555d38c0ba8b498b8bfd6efbd7e2","url":"text/suttas/KN/Ud/ud8_10.txt"},{"revision":"1af1620cf4dd48fd8aa443ce37abc723","url":"text/suttas/KN/Ud/ud8_2.txt"},{"revision":"8730bafb4adb235e5d4d793fe498bd77","url":"text/suttas/KN/Ud/ud8_3.txt"},{"revision":"50eb34b8e442db2f372c5178dea2993a","url":"text/suttas/KN/Ud/ud8_4.txt"},{"revision":"003faa4204f8f3532eeeaf5da7d22333","url":"text/suttas/KN/Ud/ud8_5.txt"},{"revision":"ee24f4420cb2226dde2430e78d48fe8d","url":"text/suttas/KN/Ud/ud8_6.txt"},{"revision":"a7bd620398d5baef11a1c7f2552d625b","url":"text/suttas/KN/Ud/ud8_7.txt"},{"revision":"a7757b1d152a60c424e42b8eb75048b2","url":"text/suttas/KN/Ud/ud8_8.txt"},{"revision":"1e37638036bf80e2d30d6aa72f555e50","url":"text/suttas/KN/Ud/ud8_9.txt"},{"revision":"b3d6db9417025e637831104bc1cd7ed3","url":"text/suttas/MN/MN1.txt"},{"revision":"f7b5672cffff642ab5d77a536f871971","url":"text/suttas/MN/MN10.txt"},{"revision":"dd65af06023730920c7881fc70135f7f","url":"text/suttas/MN/MN101.txt"},{"revision":"10223bc896c9ba61ffe3c4a53d42106d","url":"text/suttas/MN/MN102.txt"},{"revision":"4fa80872ff7dad93c58862cbea833014","url":"text/suttas/MN/MN105.txt"},{"revision":"aa29f15215a061fb7dc2cefc3a12622f","url":"text/suttas/MN/MN106.txt"},{"revision":"f98610d10be248b46665ae1aac35d87c","url":"text/suttas/MN/MN107.txt"},{"revision":"e3ae84571e46107f6a73bb98e26479c5","url":"text/suttas/MN/MN108.txt"},{"revision":"5870b771587db80dbcefc3caa5b2afa5","url":"text/suttas/MN/MN109.txt"},{"revision":"82222779511d4485fb63cd17f83e33e1","url":"text/suttas/MN/MN11.txt"},{"revision":"02d3cdef583fd22ca1273bc749378021","url":"text/suttas/MN/MN110.txt"},{"revision":"5cf16a57a385aca42f92bfc83ee0464f","url":"text/suttas/MN/MN111.txt"},{"revision":"b5700872a053d25bb9bfd5c109e6db93","url":"text/suttas/MN/MN113.txt"},{"revision":"a8378c1191eca29cc28224f04b3d4d08","url":"text/suttas/MN/MN117.txt"},{"revision":"66c1f405d27c0dac8335858cb85265f8","url":"text/suttas/MN/MN118.txt"},{"revision":"a645850e557053ae4cb568e286afadf4","url":"text/suttas/MN/MN119.txt"},{"revision":"929b72c829d219324edcd8e15678b56b","url":"text/suttas/MN/MN12.txt"},{"revision":"a43b61ea3708fad2a7a2183d3aeeef4a","url":"text/suttas/MN/MN121.txt"},{"revision":"5b7eebba4f5e00ce1821d607905928b9","url":"text/suttas/MN/MN122.txt"},{"revision":"415e6cfd7bf6837569aa63c6f32d17c8","url":"text/suttas/MN/MN123.txt"},{"revision":"e48f511c8b7e459dc9794dfb8bdba31a","url":"text/suttas/MN/MN125.txt"},{"revision":"3fb272c2a708acec519a6d001550afa6","url":"text/suttas/MN/MN126.txt"},{"revision":"a1bd408d0f294f9f1f3ee4d550e50b4a","url":"text/suttas/MN/MN128.txt"},{"revision":"05bdcec9d5f2214b13a530c3f253f808","url":"text/suttas/MN/MN13.txt"},{"revision":"96f83ec0b93248ba0d04a02ded6b1ac6","url":"text/suttas/MN/MN130.txt"},{"revision":"69112121be75cf62136177860ac6d89e","url":"text/suttas/MN/MN131.txt"},{"revision":"7c1ca249108b253ff3ecdf5667eae146","url":"text/suttas/MN/MN135.txt"},{"revision":"b3ab48393d68946444f431fc89f32c90","url":"text/suttas/MN/MN136.txt"},{"revision":"eb4ac3781703dc81ec6a3df039e2ad24","url":"text/suttas/MN/MN137.txt"},{"revision":"eab33947bec6b456ec4d7709bd0c0b19","url":"text/suttas/MN/MN138.txt"},{"revision":"18a0cc45f9738fe2ffba8c60134df5af","url":"text/suttas/MN/MN14.txt"},{"revision":"0be12d616d43699dbca307f3789d1d15","url":"text/suttas/MN/MN140.txt"},{"revision":"6b2d91b12f29134d89f7e1156a6e57e8","url":"text/suttas/MN/MN141.txt"},{"revision":"d34d80356881aeeb222393b2b133a8aa","url":"text/suttas/MN/MN143.txt"},{"revision":"0e9c2c2da5c6b7aa5ecd9cde99a1cb90","url":"text/suttas/MN/MN146.txt"},{"revision":"a371d716f6d00ea16a8596a84fc1ad4e","url":"text/suttas/MN/MN147.txt"},{"revision":"275bd7532bc9e721aa71095d582efd96","url":"text/suttas/MN/MN148.txt"},{"revision":"e0a343ef2fd6e37a212dd91bbdc62b96","url":"text/suttas/MN/MN149.txt"},{"revision":"58319d0e1f64a557c6b8a88cc23a4a0e","url":"text/suttas/MN/MN151.txt"},{"revision":"1c1480d233a023daf995985d3ce52257","url":"text/suttas/MN/MN152.txt"},{"revision":"25cd160ab9b67daaec53cebc6a29ced0","url":"text/suttas/MN/MN18.txt"},{"revision":"9b6d56de973bfaa08eaa487cf5883d22","url":"text/suttas/MN/MN19.txt"},{"revision":"204c9765ac3f0d93fce0ce55c7f1416c","url":"text/suttas/MN/MN2.txt"},{"revision":"1bad138deaee7be3be25c04cebb65a64","url":"text/suttas/MN/MN20.txt"},{"revision":"a3462986774dd66ac3b31e908c47137d","url":"text/suttas/MN/MN21.txt"},{"revision":"4d0c00e416b679c5c9d28e355a462fac","url":"text/suttas/MN/MN22.txt"},{"revision":"be0d1aeb481d70e11e56c70d98f5bf60","url":"text/suttas/MN/MN24.txt"},{"revision":"02e3af0db9e657a6a815f324dbb570a1","url":"text/suttas/MN/MN25.txt"},{"revision":"a746f09825767e5751286d5cb6cad598","url":"text/suttas/MN/MN26.txt"},{"revision":"701ec5a7d1f1c2f940ab3bc4038fbc40","url":"text/suttas/MN/MN27.txt"},{"revision":"4ea566881bd8c92514de75ac35ff0ef3","url":"text/suttas/MN/MN28.txt"},{"revision":"5a35691d0c8883571d3ac1730d72ad08","url":"text/suttas/MN/MN29.txt"},{"revision":"dec301c6b7b6cf95b5db8c2385f8908d","url":"text/suttas/MN/MN30.txt"},{"revision":"605795524f6866f547257f19f1e0f171","url":"text/suttas/MN/MN31.txt"},{"revision":"a3b5e7179a8781fcb3eb1d1abe2394ad","url":"text/suttas/MN/MN33.txt"},{"revision":"ddf50a0a5af5646a06b989b8d3058683","url":"text/suttas/MN/MN35.txt"},{"revision":"94b2912c93621d732ff596aead9f2bbf","url":"text/suttas/MN/MN36.txt"},{"revision":"e19785b53881007618bf53dd261edd79","url":"text/suttas/MN/MN38.txt"},{"revision":"f7e38bcb63aeb6daf16a4c462a3b9a58","url":"text/suttas/MN/MN39.txt"},{"revision":"0a1e1bb90cfc73c8e571b7e829169e8a","url":"text/suttas/MN/MN4.txt"},{"revision":"a9e25c77ff18a71b346cbaee51a31f5d","url":"text/suttas/MN/MN40.txt"},{"revision":"72965c2e4fb6c0271ae0f9f8b1bfbaed","url":"text/suttas/MN/MN41.txt"},{"revision":"144c46592841fc5b12923498b2bda0f9","url":"text/suttas/MN/MN43.txt"},{"revision":"540846f432ad0108acdf59d799eb4ffd","url":"text/suttas/MN/MN44.txt"},{"revision":"ebb02545169aa9b70df756870b7c96c2","url":"text/suttas/MN/MN45.txt"},{"revision":"efdb7a71a9de2cb193f6dd10bfe113fa","url":"text/suttas/MN/MN48.txt"},{"revision":"cfce4b3ce990b4acaea0b633fc7f9f84","url":"text/suttas/MN/MN49.txt"},{"revision":"cded6ed53713ff8b7ed698c6312790e8","url":"text/suttas/MN/MN5.txt"},{"revision":"b02c2f4e92d03a892799b4898576d933","url":"text/suttas/MN/MN51.txt"},{"revision":"10d78c8b38df648d5df3b706f6fbb80d","url":"text/suttas/MN/MN52.txt"},{"revision":"4de26876326506ba6242341f3aa171c1","url":"text/suttas/MN/MN53.txt"},{"revision":"e51755d77c52b48538f1743d35243b68","url":"text/suttas/MN/MN54.txt"},{"revision":"61278cebc3b85136d28442436b544028","url":"text/suttas/MN/MN55.txt"},{"revision":"590123f1c3a607793b0b0c6aacc5bd49","url":"text/suttas/MN/MN56.txt"},{"revision":"dfc51731790cdd108d22d1f7fd6c8e67","url":"text/suttas/MN/MN58.txt"},{"revision":"b484096069285edf1660253f195995f8","url":"text/suttas/MN/MN59.txt"},{"revision":"ce1e3c55feec311000654ce1d12bfcfd","url":"text/suttas/MN/MN6.txt"},{"revision":"9db7a502a9b35fb0cfcd63ba2df14655","url":"text/suttas/MN/MN60.txt"},{"revision":"12d11c463171b8931ba4879832861b8f","url":"text/suttas/MN/MN61.txt"},{"revision":"9f4c9215d1de5e2be561723e97f4357b","url":"text/suttas/MN/MN62.txt"},{"revision":"e50db8f888b45ecc1967cc1fe4d8ec95","url":"text/suttas/MN/MN63.txt"},{"revision":"c65b8a1318ce576bf20906b277de5c94","url":"text/suttas/MN/MN64.txt"},{"revision":"fae1ee0ba0ffc5c7634235d81570050b","url":"text/suttas/MN/MN66.txt"},{"revision":"7dd7138da9361770e1be2ddc6d8fd1a7","url":"text/suttas/MN/MN67.txt"},{"revision":"4c6322b6d160b0eae76e9105245cb4d9","url":"text/suttas/MN/MN69.txt"},{"revision":"789228ee0e1d3d1c992839f728096fcf","url":"text/suttas/MN/MN7.txt"},{"revision":"05cf41aee729a0e75d4dbdc2b46d157d","url":"text/suttas/MN/MN70.txt"},{"revision":"1b62d63adaedc1ccd6a83f8c6e699254","url":"text/suttas/MN/MN72.txt"},{"revision":"53f8daa0954d6ff22bed7610b982da18","url":"text/suttas/MN/MN74.txt"},{"revision":"2d09375fbd3606af65819d3514a57cd4","url":"text/suttas/MN/MN75.txt"},{"revision":"e87cccdad9375cb8b60120fe2e166110","url":"text/suttas/MN/MN77.txt"},{"revision":"51c2a1a58ce9e86f2e5dccddc339cf0c","url":"text/suttas/MN/MN78.txt"},{"revision":"8eadfdc611e6198467904b37d92ea4b7","url":"text/suttas/MN/MN82.txt"},{"revision":"e8e3815d9c068aa29831611b6ba9bee1","url":"text/suttas/MN/MN86.txt"},{"revision":"a43e845f43214aa4da29fb46d64ebed0","url":"text/suttas/MN/MN87.txt"},{"revision":"8c3ff67ea63cd1234ade8e6d32e09853","url":"text/suttas/MN/MN9.txt"},{"revision":"50134c5ffc6099e2ac1c245e2b9d9dc1","url":"text/suttas/MN/MN90.txt"},{"revision":"1e1ae88d27a209bf0d730747653ee672","url":"text/suttas/MN/MN91.txt"},{"revision":"ca5ed9d725b0987508fbf1b70387865f","url":"text/suttas/MN/MN93.txt"},{"revision":"ad545123d94f90636e2b09062ab28e5c","url":"text/suttas/MN/MN95.txt"},{"revision":"33e2ab716c7f83e5603fa2fbb28d22db","url":"text/suttas/MN/MN97.txt"},{"revision":"f68b69fdb4cadf6da3bf29411f3abaab","url":"text/suttas/SN/SN1_1.txt"},{"revision":"9fb07603be5261a68712771323dbec20","url":"text/suttas/SN/SN1_10.txt"},{"revision":"27387c2646e8fcdf93c063fd1cdcb70d","url":"text/suttas/SN/SN1_18.txt"},{"revision":"e336abcb5e4471d556d6e4cb2ea70b2c","url":"text/suttas/SN/SN1_2.txt"},{"revision":"f18b6c653a22ca479f29890b15b1af60","url":"text/suttas/SN/SN1_20.txt"},{"revision":"af69587de584642275a933ffc2f5299c","url":"text/suttas/SN/SN1_25.txt"},{"revision":"52a8db616be61e93b4c08aa504b7c2cd","url":"text/suttas/SN/SN1_38.txt"},{"revision":"0b11ad71e4e9801f3595b84aa0def521","url":"text/suttas/SN/SN1_41.txt"},{"revision":"2c935b531d2ac33ed3f5934ad7803eab","url":"text/suttas/SN/SN1_42.txt"},{"revision":"17dde1b9a562cba4821fd2815ea92305","url":"text/suttas/SN/SN1_51.txt"},{"revision":"aab1ed9b8f778dc299dc6953341717d0","url":"text/suttas/SN/SN1_55.txt"},{"revision":"011ee70f8ca680c6c5ffee3900c2f852","url":"text/suttas/SN/SN1_56.txt"},{"revision":"76f007f12af53a881f63396732e9874a","url":"text/suttas/SN/SN1_57.txt"},{"revision":"ed6c339cbd9650f408b4c6cf68132b02","url":"text/suttas/SN/SN1_64.txt"},{"revision":"b69071953d536914f773742821fc6d50","url":"text/suttas/SN/SN1_69.txt"},{"revision":"0a77e6562c5f4dd7441159dca54c1535","url":"text/suttas/SN/SN1_7.txt"},{"revision":"89eb05f603131b407e09f8a9fb1780f6","url":"text/suttas/SN/SN1_71.txt"},{"revision":"ad7ea0ac681cb586925d91159dcdf5a7","url":"text/suttas/SN/SN1_9.txt"},{"revision":"8af180d980ae95b8b1b98fd673294ede","url":"text/suttas/SN/SN10_12.txt"},{"revision":"87462eb8598cc47fb1b838e71ad1d3e0","url":"text/suttas/SN/SN10_4.txt"},{"revision":"d7e8f53b6983e32580b37e1eed149399","url":"text/suttas/SN/SN10_8.txt"},{"revision":"ef5c6593013ed5351d0d009f97039983","url":"text/suttas/SN/SN11_14.txt"},{"revision":"9c7987ff420e8889d603daf32e4a8b2a","url":"text/suttas/SN/SN11_15.txt"},{"revision":"81c2a793a53e3c2171b48d1c0d059534","url":"text/suttas/SN/SN11_22.txt"},{"revision":"edc2c92b5e8c8d889614f90aa431cae1","url":"text/suttas/SN/SN11_24.txt"},{"revision":"dba87500219b8c0a687e019d729fe2e9","url":"text/suttas/SN/SN11_3.txt"},{"revision":"7d54b5e01cffc2a8cf9d04e3eaa78f5a","url":"text/suttas/SN/SN11_5.txt"},{"revision":"1780854d44ef5dc540853bdf2aef21ef","url":"text/suttas/SN/SN12_10.txt"},{"revision":"6359141cab45b2eb78b199a6b81fc9bf","url":"text/suttas/SN/SN12_11.txt"},{"revision":"b975992cbe7193ad0a75a936705df058","url":"text/suttas/SN/SN12_12.txt"},{"revision":"d0f21a049e1553b3191db4fb99178433","url":"text/suttas/SN/SN12_15.txt"},{"revision":"a2ae79a159bccf5a68b6745f125b2bd5","url":"text/suttas/SN/SN12_17.txt"},{"revision":"f54946dd13a08e437e59afde1d4ffff4","url":"text/suttas/SN/SN12_18.txt"},{"revision":"ed758dfc8348ce308f0d953b0a4de70e","url":"text/suttas/SN/SN12_19.txt"},{"revision":"39b88c2e79b691dbd4851233aaa1ac94","url":"text/suttas/SN/SN12_2.txt"},{"revision":"26e433e9b967abc6ff7845df67811509","url":"text/suttas/SN/SN12_20.txt"},{"revision":"19f872bf4499ce705c75926d29b0799f","url":"text/suttas/SN/SN12_23.txt"},{"revision":"5ff5e7520daaceb412f8786b0bb1bc0e","url":"text/suttas/SN/SN12_25.txt"},{"revision":"4d4c261964039ae2ac6f6254a85fae29","url":"text/suttas/SN/SN12_31.txt"},{"revision":"e8b56967c9f09940cad9ad909fc1a35a","url":"text/suttas/SN/SN12_35.txt"},{"revision":"fe92d1b469978d95fac5a81c698bf45c","url":"text/suttas/SN/SN12_38.txt"},{"revision":"83566289d2b950c1663e926a046e39b8","url":"text/suttas/SN/SN12_44.txt"},{"revision":"7e9c81a78c6c979d9e1cd3e09024b6f5","url":"text/suttas/SN/SN12_46.txt"},{"revision":"ff572b4affd8dee29bd3fceaef1a4a5a","url":"text/suttas/SN/SN12_48.txt"},{"revision":"3da26ee525f14f7a227178e9ec74e982","url":"text/suttas/SN/SN12_51.txt"},{"revision":"b1c22811ec9ad8cb233b11486949b6f5","url":"text/suttas/SN/SN12_52.txt"},{"revision":"3c7236dc2d199d85cbf07bac47392747","url":"text/suttas/SN/SN12_55.txt"},{"revision":"c5562fef5f81bf981891550b8bb323a3","url":"text/suttas/SN/SN12_61.txt"},{"revision":"08d47986d091402b8562778a3e169e49","url":"text/suttas/SN/SN12_62.txt"},{"revision":"58b500cc4715fbc9a59f9f07bb6935df","url":"text/suttas/SN/SN12_63.txt"},{"revision":"d1284b14363f2eb29b5c10e9a011de8e","url":"text/suttas/SN/SN12_64.txt"},{"revision":"b693d589ffe4ee9ddfc4adbb01ea4034","url":"text/suttas/SN/SN12_65.txt"},{"revision":"54d44e26a717b433d3ced61ba77b6350","url":"text/suttas/SN/SN12_66.txt"},{"revision":"a18600a4926f7f9b5b0d4eb69c191620","url":"text/suttas/SN/SN12_67.txt"},{"revision":"3cd2bcf7c78c277be76add66c00e0cc4","url":"text/suttas/SN/SN12_68.txt"},{"revision":"d0e9b86ab7b66b273802156104ab3720","url":"text/suttas/SN/SN12_69.txt"},{"revision":"4367ca870bb14da41965ae716f1c9ffe","url":"text/suttas/SN/SN12_70.txt"},{"revision":"17f13db940a8b96da5704547760ef398","url":"text/suttas/SN/SN13_1.txt"},{"revision":"95a4bfba85e0bb3a3c6f20bbe0d1438c","url":"text/suttas/SN/SN13_2.txt"},{"revision":"11910e7fe19265fd48bda3a5dd0c3df5","url":"text/suttas/SN/SN13_8.txt"},{"revision":"ee003b7475d760a3b84ba376e8629aac","url":"text/suttas/SN/SN14_11.txt"},{"revision":"bcebd46dc56ee636cd8381dfa52b9cd4","url":"text/suttas/SN/SN15_10.txt"},{"revision":"06c5f45ee845732c9f4dcc2ce4c0e748","url":"text/suttas/SN/SN15_11.txt"},{"revision":"232325d08ad88000053c49e88e0f24bb","url":"text/suttas/SN/SN15_12.txt"},{"revision":"81a905c158ec3fc7b2b29f8377d4a36b","url":"text/suttas/SN/SN15_13.txt"},{"revision":"6ccd9a2752b5a83a3d7789d32f39e1b1","url":"text/suttas/SN/SN15_14.txt"},{"revision":"99dc749e18fa81869b228c378a832013","url":"text/suttas/SN/SN15_3.txt"},{"revision":"5f578433b42359c685124a828b0e873d","url":"text/suttas/SN/SN15_5.txt"},{"revision":"b2c3de644d76b348bc0fb26c23e89608","url":"text/suttas/SN/SN15_6.txt"},{"revision":"523403410ce72f1fb246b960ad728f64","url":"text/suttas/SN/SN15_8.txt"},{"revision":"07e2cc516c35e800d5a60252210587a7","url":"text/suttas/SN/SN15_9.txt"},{"revision":"744c1a3557f63a15425b09795791cb07","url":"text/suttas/SN/SN16_11.txt"},{"revision":"8988f6eb36e1c2dbe74756da92ef5933","url":"text/suttas/SN/SN16_13.txt"},{"revision":"efa9f7873e1fa0b50332c07f6d0cb3f1","url":"text/suttas/SN/SN16_2.txt"},{"revision":"895d3225a6ec64191ca72eea3fb6df4e","url":"text/suttas/SN/SN16_5.txt"},{"revision":"45117b746093ea90915976aaab6feb2d","url":"text/suttas/SN/SN17_3.txt"},{"revision":"3c39bfa7b216d18c6502a07f6f4102cf","url":"text/suttas/SN/SN17_5.txt"},{"revision":"47a72dd727fef802623a8c582ee2b619","url":"text/suttas/SN/SN17_8.txt"},{"revision":"234dde0bcabed3bb9d0496aaf630baea","url":"text/suttas/SN/SN2_17.txt"},{"revision":"ebc985d7fdd53b9f662e93e8f4eac8de","url":"text/suttas/SN/SN2_19.txt"},{"revision":"f973c0cffc36584d5bce8e2dd77231e5","url":"text/suttas/SN/SN2_2.txt"},{"revision":"61230f394aa2a3c128dd982e414ca8f8","url":"text/suttas/SN/SN2_22.txt"},{"revision":"b7b45d9ed0b18be60e041fd5536ecc8e","url":"text/suttas/SN/SN2_7.txt"},{"revision":"abcab4fbdff1506a539699a1c5a6bc1c","url":"text/suttas/SN/SN20_2.txt"},{"revision":"91cede79e520eae14aab5e92f2a17837","url":"text/suttas/SN/SN20_4.txt"},{"revision":"67e57b39ac953e787844826dc3dee452","url":"text/suttas/SN/SN20_5.txt"},{"revision":"4c197be251940048161c5e71c3225fe2","url":"text/suttas/SN/SN20_6.txt"},{"revision":"6ebbf72f3470c45a4d95dbf9fd9666b4","url":"text/suttas/SN/SN20_7.txt"},{"revision":"8150abbfab2df042e7e5d52304d62f06","url":"text/suttas/SN/SN21_1.txt"},{"revision":"b9a125c6a9b3c81e6a6f3203badf32ca","url":"text/suttas/SN/SN21_10.txt"},{"revision":"c8e5340f73305890dfb302a1fd903a79","url":"text/suttas/SN/SN21_2.txt"},{"revision":"ada3051a6f55599852b985bddd64aca6","url":"text/suttas/SN/SN21_3.txt"},{"revision":"d8eb166e0ff7450d2f0048aebcd098dd","url":"text/suttas/SN/SN21_6.txt"},{"revision":"74a1ff0f8ad2a71ed3fbc0f8cfb7e338","url":"text/suttas/SN/SN21_9.txt"},{"revision":"87c0aca5c63b41c44fbf7af5a9dc7328","url":"text/suttas/SN/SN22_1.txt"},{"revision":"e7aed9b7901c29c8becbf3ca57de957c","url":"text/suttas/SN/SN22_100.txt"},{"revision":"99f5f5ad8fc10086ed03193d404535ac","url":"text/suttas/SN/SN22_101.txt"},{"revision":"8c6eb80d70fa6b2abdb956b3599b5258","url":"text/suttas/SN/SN22_121.txt"},{"revision":"b433b3d945841c39e469ec6d271277f1","url":"text/suttas/SN/SN22_122.txt"},{"revision":"239d5ce22517c4dc7b990b109a93feab","url":"text/suttas/SN/SN22_126.txt"},{"revision":"ccbcdd0eb6e07c609c2ff707dff2ed36","url":"text/suttas/SN/SN22_127.txt"},{"revision":"c18edd90b5485ce3047e3161c557b8f0","url":"text/suttas/SN/SN22_131.txt"},{"revision":"6b8a1f1c935f98d28df55bb6b7dbb438","url":"text/suttas/SN/SN22_132.txt"},{"revision":"97db90e30f819069b3a1f9bf18a8f61c","url":"text/suttas/SN/SN22_18.txt"},{"revision":"09b4c4c3cfe1db1c84226afbd7c1340c","url":"text/suttas/SN/SN22_19.txt"},{"revision":"d1d4ef26cf2aba672514bd6f019af4f2","url":"text/suttas/SN/SN22_2.txt"},{"revision":"4cafce4aa4fe6fc8654ebc059d38ea7c","url":"text/suttas/SN/SN22_20.txt"},{"revision":"4c2fde3b8b77d6d3bace7d4a8745a023","url":"text/suttas/SN/SN22_22.txt"},{"revision":"94eba8070a171fa04b44333701fc04ea","url":"text/suttas/SN/SN22_23.txt"},{"revision":"f0b0bac1998169b29813b02b671edab6","url":"text/suttas/SN/SN22_3.txt"},{"revision":"03ad1d810dfac2bdd0aad02283fc4782","url":"text/suttas/SN/SN22_36.txt"},{"revision":"e4b2ed0927970e7e4048b8c055f59d8f","url":"text/suttas/SN/SN22_39.txt"},{"revision":"2153161d61f0345d319772bef257a2e8","url":"text/suttas/SN/SN22_40.txt"},{"revision":"c34348e0ccd7968460a8132333e10fa4","url":"text/suttas/SN/SN22_41.txt"},{"revision":"c5b7f011f7610b3d1c12e8aacc4e1b3b","url":"text/suttas/SN/SN22_42.txt"},{"revision":"431b2992114979687eb2834bf0214961","url":"text/suttas/SN/SN22_47.txt"},{"revision":"e343f5d196af59bb9ea44264e94d228b","url":"text/suttas/SN/SN22_48.txt"},{"revision":"130fde8cdfda29e69039a9c4046fa3a4","url":"text/suttas/SN/SN22_5.txt"},{"revision":"b3b6820301ead93efb5a17c139b1b6cd","url":"text/suttas/SN/SN22_53.txt"},{"revision":"7008bbc8f7e74c140c512531e871592d","url":"text/suttas/SN/SN22_54.txt"},{"revision":"5a8bde78aee89ebc819fc4b3077c2ccf","url":"text/suttas/SN/SN22_55.txt"},{"revision":"08ed09e2c233eecb83e9b2fbf2233c46","url":"text/suttas/SN/SN22_56.txt"},{"revision":"31156575245a6324d3f8ae9561302adb","url":"text/suttas/SN/SN22_57.txt"},{"revision":"43b241f15eb45306c0f131f342700736","url":"text/suttas/SN/SN22_58.txt"},{"revision":"397cde6d160a59683b69ceaca05bd459","url":"text/suttas/SN/SN22_59.txt"},{"revision":"1d3e40def477caf5d9eb871f3eaa1ea9","url":"text/suttas/SN/SN22_60.txt"},{"revision":"a6e3b5f890d6f66dc83009e718b5c64a","url":"text/suttas/SN/SN22_76.txt"},{"revision":"945f52a3a3e5599a835e81c5a1bc7916","url":"text/suttas/SN/SN22_78.txt"},{"revision":"4cdbc5872a3484dfbff79b8bd61132c8","url":"text/suttas/SN/SN22_79.txt"},{"revision":"1656a648e7f172366f2e6cfaefc77e6e","url":"text/suttas/SN/SN22_80.txt"},{"revision":"1f300283e3a44f6706d7bd77b2ac97ed","url":"text/suttas/SN/SN22_81.txt"},{"revision":"68f9ad84e71b622b7f61ffc4d152fc79","url":"text/suttas/SN/SN22_82.txt"},{"revision":"63331116667538b05504779f7bf824ae","url":"text/suttas/SN/SN22_83.txt"},{"revision":"2a8de1b3c8f2ccef0706971490bdcb5b","url":"text/suttas/SN/SN22_84.txt"},{"revision":"0e1aff38921a55bdd4832d0e9ae96745","url":"text/suttas/SN/SN22_85.txt"},{"revision":"fac04d728a27b54ae9dd88be6d2c446f","url":"text/suttas/SN/SN22_86.txt"},{"revision":"e386f68f9e207cad1f9ea5b547cd1256","url":"text/suttas/SN/SN22_88.txt"},{"revision":"1a6060c3ffdc779d89e5d84aef71770b","url":"text/suttas/SN/SN22_89.txt"},{"revision":"9c278c3b7a723b700707adc80207be50","url":"text/suttas/SN/SN22_90.txt"},{"revision":"4b5b33665744ee2d6a600936eaead63e","url":"text/suttas/SN/SN22_93.txt"},{"revision":"d4c2f812ad04a0317e532209d30800ea","url":"text/suttas/SN/SN22_94.txt"},{"revision":"3cb22ecd26b9435ea8c9264cc845247d","url":"text/suttas/SN/SN22_95.txt"},{"revision":"adcd927760ab374eb42be3c3d9a9f6b0","url":"text/suttas/SN/SN22_96.txt"},{"revision":"a3459d4d1762e3a857686904a1763fe5","url":"text/suttas/SN/SN22_97.txt"},{"revision":"3bc6438700f08dcc9b402d593509fd2e","url":"text/suttas/SN/SN22_99.txt"},{"revision":"a9fa6fd4c2178fe986573e01ba5128ae","url":"text/suttas/SN/SN23_1.txt"},{"revision":"bfe4a3e30f7f014a5b8fc7ff4efa3b00","url":"text/suttas/SN/SN23_2.txt"},{"revision":"3fae86d0415d060d857bdd742ad05543","url":"text/suttas/SN/SN25_1.txt"},{"revision":"66acea693198d765ae74a75686f2da73","url":"text/suttas/SN/SN25_10.txt"},{"revision":"47c5b7da63c6b8a34ac0a23f0d4cec9f","url":"text/suttas/SN/SN25_2.txt"},{"revision":"d9a69fc94052b66f339a2b6e0602334d","url":"text/suttas/SN/SN25_3.txt"},{"revision":"cded71e70d7f65a5787f47ae269f4b63","url":"text/suttas/SN/SN25_4.txt"},{"revision":"835630184c3cebd2a39c211a21ad610e","url":"text/suttas/SN/SN25_5.txt"},{"revision":"29da6a785b9f651125f04c7dbc94f9f4","url":"text/suttas/SN/SN25_6.txt"},{"revision":"eb79d970a3cd530de41e5bd7a0bff951","url":"text/suttas/SN/SN25_7.txt"},{"revision":"2d9f8826fd543333ef61bb7786c73b5a","url":"text/suttas/SN/SN25_8.txt"},{"revision":"3e89215939e552e4378767677c4f57ea","url":"text/suttas/SN/SN25_9.txt"},{"revision":"c21624199544db3397a8969fa18c887b","url":"text/suttas/SN/SN27_1.txt"},{"revision":"57ed5a03d5718b06833d00929f309b15","url":"text/suttas/SN/SN27_10.txt"},{"revision":"2f6650f3f44ff6e78d9a011b31461bcb","url":"text/suttas/SN/SN27_2.txt"},{"revision":"d0e5bf6fce69f5150725a3e1f9bbdbf9","url":"text/suttas/SN/SN27_3.txt"},{"revision":"b8b43740cab21e64d1b3ff213e0c2ec5","url":"text/suttas/SN/SN27_4.txt"},{"revision":"084ea5fdededf01fb59ee01754b6a115","url":"text/suttas/SN/SN27_5.txt"},{"revision":"ac9f6b1e8b007eb4f77df51f47917568","url":"text/suttas/SN/SN27_6.txt"},{"revision":"ee96b3c57271486b51e6d7593832c722","url":"text/suttas/SN/SN27_7.txt"},{"revision":"dc11600775cfe3a48651dc27010978cb","url":"text/suttas/SN/SN27_8.txt"},{"revision":"c06a180382034467d328d538d58b450e","url":"text/suttas/SN/SN27_9.txt"},{"revision":"e413045d699e1368e765f1279d11391f","url":"text/suttas/SN/SN3_1.txt"},{"revision":"e83e7cb676f44e8f3b2f8dd65d21d9c8","url":"text/suttas/SN/SN3_10.txt"},{"revision":"ea77698c85bc06aebd5f5978568645b2","url":"text/suttas/SN/SN3_11.txt"},{"revision":"155592dafb9442dde94bd86ef75ad897","url":"text/suttas/SN/SN3_14.txt"},{"revision":"f025ced239ba47dc81786537a59a8c93","url":"text/suttas/SN/SN3_15.txt"},{"revision":"6bdb27c6ec6fdf07da35ac64ce27469d","url":"text/suttas/SN/SN3_17.txt"},{"revision":"e24d8cd5d2de1ef51e65ad9f7ad6d8a4","url":"text/suttas/SN/SN3_19.txt"},{"revision":"59a13d065670afaecffc1741ff6ef62b","url":"text/suttas/SN/SN3_20.txt"},{"revision":"2af9147a73cc64b5166739f76a4591a8","url":"text/suttas/SN/SN3_21.txt"},{"revision":"98be55d169c0eedcd872d39b91a09b61","url":"text/suttas/SN/SN3_22.txt"},{"revision":"a55148ef2d9737246c8a96d81c8734ab","url":"text/suttas/SN/SN3_23.txt"},{"revision":"0b1e28cf69fa5017ca1eccbb13396939","url":"text/suttas/SN/SN3_24.txt"},{"revision":"f96c2132f0e41c428f0c9aa780386c95","url":"text/suttas/SN/SN3_25.txt"},{"revision":"86f4676648fc5e17a35f4760cd2b9745","url":"text/suttas/SN/SN3_4.txt"},{"revision":"70201d11ce96fdb62a40eb13d2a5d14e","url":"text/suttas/SN/SN3_5.txt"},{"revision":"68862e8245e804d076bd0f44a058d9c1","url":"text/suttas/SN/SN3_6.txt"},{"revision":"25ce608aa7a0b5f0e448425ef549a6d9","url":"text/suttas/SN/SN3_7.txt"},{"revision":"dae298d28a59ecf3a00eb3bea057289c","url":"text/suttas/SN/SN3_8.txt"},{"revision":"3aed37e0b321ba9644c142afd34c0965","url":"text/suttas/SN/SN3_9.txt"},{"revision":"774787f2eb4a0e630218bbdb93fee68c","url":"text/suttas/SN/SN35_101.txt"},{"revision":"c739bedec962f15a923c7e96ca992d7b","url":"text/suttas/SN/SN35_115.txt"},{"revision":"2283989c082d988f40d5e347d77108f4","url":"text/suttas/SN/SN35_116.txt"},{"revision":"c0d141fac230318861607ba10899a6ec","url":"text/suttas/SN/SN35_117.txt"},{"revision":"03209d06f03674e68f1b77ee8da0b2f5","url":"text/suttas/SN/SN35_118.txt"},{"revision":"75b9f95227f0df8842bc2d5b0ee2c2df","url":"text/suttas/SN/SN35_127.txt"},{"revision":"3783af370e811d5116b40654d36119bc","url":"text/suttas/SN/SN35_134.txt"},{"revision":"e7eb504815159582d49f6fadc980af1f","url":"text/suttas/SN/SN35_135.txt"},{"revision":"a966ad338612cb6821799381208334dd","url":"text/suttas/SN/SN35_136.txt"},{"revision":"525936f6954e00778043b31e795b0831","url":"text/suttas/SN/SN35_145.txt"},{"revision":"6cefff7e3160967b40f659a7f93a1b50","url":"text/suttas/SN/SN35_153.txt"},{"revision":"f8daa7fe0e442dd7468289b0fe27be07","url":"text/suttas/SN/SN35_17.txt"},{"revision":"02abf6428f014cefd64712d363d8646b","url":"text/suttas/SN/SN35_18.txt"},{"revision":"b48d8f05191a7c2c518e59c9371a3101","url":"text/suttas/SN/SN35_187.txt"},{"revision":"4890c143162cfbfdd0ab4ac723445592","url":"text/suttas/SN/SN35_188.txt"},{"revision":"2dc64b9bfcd2b2e53b423e1453d8bac3","url":"text/suttas/SN/SN35_189.txt"},{"revision":"88615a6f4f5d7a1e1220a28913997f8d","url":"text/suttas/SN/SN35_19.txt"},{"revision":"8b4ffb01b6a806522fcdbef09050eb96","url":"text/suttas/SN/SN35_190.txt"},{"revision":"dc9c03ff1a3ae7059561bde7348ccbb6","url":"text/suttas/SN/SN35_191.txt"},{"revision":"112932bf62e108479088d58a42c9e43d","url":"text/suttas/SN/SN35_193.txt"},{"revision":"aad6bddd8cf363c1c376af3ea992f9aa","url":"text/suttas/SN/SN35_197.txt"},{"revision":"208976d880fe6b2f37fef55e51c86f33","url":"text/suttas/SN/SN35_198.txt"},{"revision":"ceb3e19bb733b4206732097ffbabe313","url":"text/suttas/SN/SN35_199.txt"},{"revision":"4788ac36de25e4cdcf28863d15ec4284","url":"text/suttas/SN/SN35_20.txt"},{"revision":"bd2f9d79e3966e218af967f54aff546e","url":"text/suttas/SN/SN35_200.txt"},{"revision":"d4a09573698952241f68b47789fac3c2","url":"text/suttas/SN/SN35_202.txt"},{"revision":"01de1890c5156efecfca61b0c60c0ddf","url":"text/suttas/SN/SN35_204.txt"},{"revision":"915066261ad47b7f74731c7b8def6fc2","url":"text/suttas/SN/SN35_205.txt"},{"revision":"8b1cdfe1938c0826672f9bbd627406a7","url":"text/suttas/SN/SN35_206.txt"},{"revision":"8bcd6c64bdd1af666d853456e96e64ba","url":"text/suttas/SN/SN35_207.txt"},{"revision":"283f0e4ab5ca9b0c8ec56425eb569843","url":"text/suttas/SN/SN35_23.txt"},{"revision":"fea30f9a57ef409baf792163f923d7cd","url":"text/suttas/SN/SN35_24.txt"},{"revision":"6555c41e49159345a20bc212a7beedcc","url":"text/suttas/SN/SN35_28.txt"},{"revision":"e290c17f5cfac0e77ca62bcd5de5e92c","url":"text/suttas/SN/SN35_63.txt"},{"revision":"823d436b3e0cbb32ead857646fe27ad8","url":"text/suttas/SN/SN35_69.txt"},{"revision":"7662b3d9fc0f227966ab1864b6997d2e","url":"text/suttas/SN/SN35_74.txt"},{"revision":"8772a621259808382e44b0bdcb878400","url":"text/suttas/SN/SN35_75.txt"},{"revision":"e688df0905cfaf7cc6c3f1ed0c121954","url":"text/suttas/SN/SN35_80.txt"},{"revision":"90fb17d06986075691cd0024833c982d","url":"text/suttas/SN/SN35_82.txt"},{"revision":"6c00e25cc9dc547c186fbfffb29a2e59","url":"text/suttas/SN/SN35_85.txt"},{"revision":"9d2c64737c7d58489c7b63461a894f4c","url":"text/suttas/SN/SN35_88.txt"},{"revision":"d2de5dfb263537097fe814f5cb7aa266","url":"text/suttas/SN/SN35_93.txt"},{"revision":"51a4b6aef2ce88e3886769f985b3bdc3","url":"text/suttas/SN/SN35_95.txt"},{"revision":"13ddc390153f4ba1f90a4004c852c57d","url":"text/suttas/SN/SN35_97.txt"},{"revision":"fa321e20f48491beb864f687d06bc27e","url":"text/suttas/SN/SN35_99.txt"},{"revision":"a640cbad76fa4901208eb406e12dbd2b","url":"text/suttas/SN/SN36_11.txt"},{"revision":"3134c562e27004fd7c7c033a3ff07006","url":"text/suttas/SN/SN36_19.txt"},{"revision":"ea9335c0c11ff4295a6f20342e4dabd6","url":"text/suttas/SN/SN36_21.txt"},{"revision":"3e2dd6aa4f1d70c076cf22af610dc6f9","url":"text/suttas/SN/SN36_22.txt"},{"revision":"d9243a98f625105e2e88cea9f6185810","url":"text/suttas/SN/SN36_23.txt"},{"revision":"1917c9061bbd88b0088a4c3c8edbaba6","url":"text/suttas/SN/SN36_31.txt"},{"revision":"cb2124d1f94e35e705fe8d5c2e9b9474","url":"text/suttas/SN/SN36_4.txt"},{"revision":"fb147c27289f3950d41fef14782217c9","url":"text/suttas/SN/SN36_6.txt"},{"revision":"a3ba0beee5314a5851b3a0c4e350c9af","url":"text/suttas/SN/SN36_7.txt"},{"revision":"c7c646d6fc610dafcfe6d1fe4762450d","url":"text/suttas/SN/SN37_34.txt"},{"revision":"320f557c24940e55c67137918b17295f","url":"text/suttas/SN/SN38_14.txt"},{"revision":"105859c83eea33bf90b494bcc1bfc400","url":"text/suttas/SN/SN4_13.txt"},{"revision":"98361e67ab6888e8e117a8c415f0e553","url":"text/suttas/SN/SN4_18.txt"},{"revision":"0db6e84fd80bd8182a4d89fe470472a3","url":"text/suttas/SN/SN4_19.txt"},{"revision":"d689001daa7195e9c5bdc55f1e6c5152","url":"text/suttas/SN/SN4_20.txt"},{"revision":"829ff4963332dd3d3131e50b700478ee","url":"text/suttas/SN/SN4_21.txt"},{"revision":"7801ad5d974d8f1854ffb555888ed4f2","url":"text/suttas/SN/SN4_8.txt"},{"revision":"f21a596b22f5aaaf38b11a8b5bee006d","url":"text/suttas/SN/SN41_10.txt"},{"revision":"70e7ddd6bdaf79025bd43c85c47bf0be","url":"text/suttas/SN/SN41_3.txt"},{"revision":"e7c243acb75913db40150f64aacd9be1","url":"text/suttas/SN/SN41_4.txt"},{"revision":"0c2bff5df31c8192978210ede46e66d7","url":"text/suttas/SN/SN41_6.txt"},{"revision":"f3e378943d62e03e360589f802ba57ed","url":"text/suttas/SN/SN41_7.txt"},{"revision":"f123aaf2beab1ff57abba52867ccc952","url":"text/suttas/SN/SN42_10.txt"},{"revision":"8436e48c5cb2842350f2b4cdb5f5d2a7","url":"text/suttas/SN/SN42_11.txt"},{"revision":"42ffdb281fbd94f2dfa0dece37bacbbf","url":"text/suttas/SN/SN42_2.txt"},{"revision":"0cfb77d60710d3621c3dd74be322024e","url":"text/suttas/SN/SN42_3.txt"},{"revision":"96818b4399856a1097245db36a7b307a","url":"text/suttas/SN/SN42_6.txt"},{"revision":"11f13b22a247084dee79acbf8dad7e65","url":"text/suttas/SN/SN42_7.txt"},{"revision":"40cd94ec6f9520512ea1103d6567a6b1","url":"text/suttas/SN/SN42_8.txt"},{"revision":"5193108f8a6b82d429cc99f7d024d8e1","url":"text/suttas/SN/SN42_9.txt"},{"revision":"1c16375dd721759fa82702df138e9346","url":"text/suttas/SN/SN43.txt"},{"revision":"35a0421888c80659889eabe0e42ca32c","url":"text/suttas/SN/SN44_1.txt"},{"revision":"8c244ba71a742d4f6018eea0c2084812","url":"text/suttas/SN/SN44_10.txt"},{"revision":"d89425eb6ec8d2c5a8463c2dca921f85","url":"text/suttas/SN/SN44_11.txt"},{"revision":"fb4f02f389642ccd056c96b1d8bd578f","url":"text/suttas/SN/SN44_3.txt"},{"revision":"e671c562ea4753e71c47c90232c7fa83","url":"text/suttas/SN/SN44_4.txt"},{"revision":"aa34eefa1f0f21032de73ccb05e6052d","url":"text/suttas/SN/SN44_5.txt"},{"revision":"b39e78095e1e9210cd32c32b8403d2c2","url":"text/suttas/SN/SN44_6.txt"},{"revision":"2066a443418488f94cc058bcf7b111e5","url":"text/suttas/SN/SN44_7.txt"},{"revision":"b0fc442b3ec2e105568d03196f8d9b24","url":"text/suttas/SN/SN44_8.txt"},{"revision":"8f7b08ae80a86410c7baa23b0d648253","url":"text/suttas/SN/SN44_9.txt"},{"revision":"556217481da20d5b89d4c64aac8f9be9","url":"text/suttas/SN/SN45_1.txt"},{"revision":"2b520ce5be7813cc0d8210eb3e6671fd","url":"text/suttas/SN/SN45_153.txt"},{"revision":"2d05b8e0006d3dccffc16bb71fe227a5","url":"text/suttas/SN/SN45_154.txt"},{"revision":"5f6d058284679ebab08a63e7a0bbae08","url":"text/suttas/SN/SN45_155.txt"},{"revision":"a8b69592ca983ac862408ed73aa34101","url":"text/suttas/SN/SN45_159.txt"},{"revision":"3838633482f9ecce8078377f1455704b","url":"text/suttas/SN/SN45_171.txt"},{"revision":"28a252de943b01b4ccce4760c1475c2c","url":"text/suttas/SN/SN45_2.txt"},{"revision":"a4e10f96995583cdb2e544089653d17e","url":"text/suttas/SN/SN45_27.txt"},{"revision":"a70438f481562b33be5daabb9fb23874","url":"text/suttas/SN/SN45_4.txt"},{"revision":"84dc7abdcb99a3bf8670defc42283611","url":"text/suttas/SN/SN45_56.txt"},{"revision":"a24f291e989c9efcf14b99bc4ca02245","url":"text/suttas/SN/SN45_8.txt"},{"revision":"f307e4840117c87f902c1f2d6020dceb","url":"text/suttas/SN/SN46_1.txt"},{"revision":"ff591f8c3df44e173e310c53e3e8add5","url":"text/suttas/SN/SN46_11.txt"},{"revision":"9d69cac1f70f6688e7fe76df38c3f07b","url":"text/suttas/SN/SN46_14.txt"},{"revision":"41e04b38e3dfdfdae569c42bc15e7412","url":"text/suttas/SN/SN46_18.txt"},{"revision":"8c372cacb0b8c2de8fc6fced1184b354","url":"text/suttas/SN/SN46_26.txt"},{"revision":"907c9c6a0db98f3dcacefcf99a3ae0b8","url":"text/suttas/SN/SN46_29.txt"},{"revision":"694ec5ebfae64511f2fe55bb1d319574","url":"text/suttas/SN/SN46_3.txt"},{"revision":"4ee1030fe51d89074cf0a272dc315c83","url":"text/suttas/SN/SN46_30.txt"},{"revision":"5e61919918a7daade748802e92e2ae70","url":"text/suttas/SN/SN46_38.txt"},{"revision":"6e19751fa9e938c6bb1f45f0a0b30845","url":"text/suttas/SN/SN46_4.txt"},{"revision":"5c519111657d6567c3bfe02160b64316","url":"text/suttas/SN/SN46_5.txt"},{"revision":"b0261e4ef48d16bb4fa4737836c0a240","url":"text/suttas/SN/SN46_51.txt"},{"revision":"52903dd3ba352154101ecdb45be585bd","url":"text/suttas/SN/SN46_52.txt"},{"revision":"017f04446a542518e368a159cb774235","url":"text/suttas/SN/SN46_53.txt"},{"revision":"8105a91efa524dc57a65d98d91a11a12","url":"text/suttas/SN/SN46_54.txt"},{"revision":"dd93f9f3bc02d58a1d1d1648bb1dd56b","url":"text/suttas/SN/SN46_8.txt"},{"revision":"dfe04ce5952ece215bc0e82625e2234e","url":"text/suttas/SN/SN47_10.txt"},{"revision":"92837614538c76bed195f90f6696eb08","url":"text/suttas/SN/SN47_13.txt"},{"revision":"23feb75fa530fa29a06e55e9f2e6f160","url":"text/suttas/SN/SN47_16.txt"},{"revision":"cec52a004defdc48a9d5e82112c17c19","url":"text/suttas/SN/SN47_19.txt"},{"revision":"8b5090da8e8636cde4d4a29c1556f1b6","url":"text/suttas/SN/SN47_20.txt"},{"revision":"70c3532078aed3d357cd815939fc3cb9","url":"text/suttas/SN/SN47_25.txt"},{"revision":"596d09f31df28139b9784761a6eb24ce","url":"text/suttas/SN/SN47_33.txt"},{"revision":"2ed3d9547d3fb91256e423434e5ad61f","url":"text/suttas/SN/SN47_35.txt"},{"revision":"629b5cf1707245c8c3ed1502ce06b2ba","url":"text/suttas/SN/SN47_37.txt"},{"revision":"f562f90e1a6fc64b597042751ac55418","url":"text/suttas/SN/SN47_38.txt"},{"revision":"3dc58665c4d8a826af8d40aa59edebb9","url":"text/suttas/SN/SN47_4.txt"},{"revision":"ec492ddcaca5460d2b9a1f3d6874f7f2","url":"text/suttas/SN/SN47_40.txt"},{"revision":"5f1d39398131c3bab38e5214d5945e48","url":"text/suttas/SN/SN47_41.txt"},{"revision":"5f58b943a18372c12fd8e771a5fb9f9c","url":"text/suttas/SN/SN47_42.txt"},{"revision":"86c5da62e6366f952a20ca408610100e","url":"text/suttas/SN/SN47_6.txt"},{"revision":"694754aaf3ece5e64c60839870d4f19a","url":"text/suttas/SN/SN47_7.txt"},{"revision":"b438f62b9e1956d46d6019894a03a23e","url":"text/suttas/SN/SN47_8.txt"},{"revision":"c0c405953ec42a0963e3c08b30e9748b","url":"text/suttas/SN/SN48_10.txt"},{"revision":"9bb351d195cb652988a9e2943feea467","url":"text/suttas/SN/SN48_21.txt"},{"revision":"0156fe4fc1026a46e25344f473eb6884","url":"text/suttas/SN/SN48_3.txt"},{"revision":"0e8b27302f8c3abea209166f4536ddac","url":"text/suttas/SN/SN48_38.txt"},{"revision":"7efd97a511e785dc880f2363026f9261","url":"text/suttas/SN/SN48_39.txt"},{"revision":"9cf3d528d4240ed371602a25b7091824","url":"text/suttas/SN/SN48_4.txt"},{"revision":"84cb8f109266f4dce237393914447d49","url":"text/suttas/SN/SN48_41.txt"},{"revision":"bed85cd5a78112fe992148324da6d025","url":"text/suttas/SN/SN48_44.txt"},{"revision":"f85d76debaabb7155983c2950252771c","url":"text/suttas/SN/SN48_46.txt"},{"revision":"76f2665db8e347b120dff8579f1f14b2","url":"text/suttas/SN/SN48_50.txt"},{"revision":"93f34d1ceb593fdbb2bb030660f70f8f","url":"text/suttas/SN/SN48_52.txt"},{"revision":"f358baaa7669bb4bd97da9450eb6f189","url":"text/suttas/SN/SN48_53.txt"},{"revision":"314b74678ce6a9646b3d709b5ed763c5","url":"text/suttas/SN/SN48_56.txt"},{"revision":"8921c81facf72c631aef3cb46234fe4c","url":"text/suttas/SN/SN48_8.txt"},{"revision":"13806a324229d52fbce5fe7f660cff9a","url":"text/suttas/SN/SN5_1.txt"},{"revision":"1697776778df755412e225a0fd04daa7","url":"text/suttas/SN/SN5_10.txt"},{"revision":"0793c443c7e2773c7125d4a1fce27660","url":"text/suttas/SN/SN5_2.txt"},{"revision":"6fff0a95f406bf03bb407b4d0fdd57a1","url":"text/suttas/SN/SN5_3.txt"},{"revision":"d978d0da2e0c90503f8b412c396c20e4","url":"text/suttas/SN/SN5_4.txt"},{"revision":"3e71e1f4e905ff478eda9c95ec7526a4","url":"text/suttas/SN/SN5_5.txt"},{"revision":"c215584623b4296604912ee3715ff906","url":"text/suttas/SN/SN5_6.txt"},{"revision":"1d9627f6dbaae0eac168b51b5f046b7b","url":"text/suttas/SN/SN5_7.txt"},{"revision":"f2a0e623453d1a83c865e23c41955601","url":"text/suttas/SN/SN5_8.txt"},{"revision":"4e1c660b85121510e7f35acd95be3b0d","url":"text/suttas/SN/SN5_9.txt"},{"revision":"c707e4509213b75d9391d10c935e5ada","url":"text/suttas/SN/SN51_13.txt"},{"revision":"64fa50af9e68877c8f551b8cc585e89d","url":"text/suttas/SN/SN51_14.txt"},{"revision":"71d3aace82be8c51d6a668b0ce52c0b4","url":"text/suttas/SN/SN51_15.txt"},{"revision":"28d26bb41b06b67e728faacdfbfb7583","url":"text/suttas/SN/SN51_20.txt"},{"revision":"e243db1309d6e8e7fde4a0a52ab70cee","url":"text/suttas/SN/SN51_22.txt"},{"revision":"8cbcefae3baa40fd8bba029c42b8ec9e","url":"text/suttas/SN/SN52_10.txt"},{"revision":"916c06320433ab99a4bcb50340852ec6","url":"text/suttas/SN/SN52_9.txt"},{"revision":"082cd5ff18952cf91ca1e0c859e7338d","url":"text/suttas/SN/SN54_11.txt"},{"revision":"c053e799854973ea49c81e5bd2573177","url":"text/suttas/SN/SN54_12.txt"},{"revision":"92e61fb54c111f016a808c1d505910e2","url":"text/suttas/SN/SN54_13.txt"},{"revision":"57c906b53e1295e657b826985873583d","url":"text/suttas/SN/SN54_6.txt"},{"revision":"38054c34b144fcf54e8a65df1248908a","url":"text/suttas/SN/SN54_8.txt"},{"revision":"ee7b79311344aab101fbc001001b4b11","url":"text/suttas/SN/SN54_9.txt"},{"revision":"e4fbcca999632607942fb26cd75c2f3d","url":"text/suttas/SN/SN55_1.txt"},{"revision":"40e26f6ef3686ab9602bf256eaae0a3c","url":"text/suttas/SN/SN55_21.txt"},{"revision":"c20f11c003aed62220748b3194dfe9dd","url":"text/suttas/SN/SN55_22.txt"},{"revision":"14add7d871c0774b171bc96378d7fa00","url":"text/suttas/SN/SN55_23.txt"},{"revision":"953bbc6e12beb18ad6022c8e15a71f0a","url":"text/suttas/SN/SN55_25.txt"},{"revision":"8ec594928df5669921eca0c9ec713006","url":"text/suttas/SN/SN55_26.txt"},{"revision":"6d11cdfbb5d28f2e7b5ae96e6c8ae2fe","url":"text/suttas/SN/SN55_27.txt"},{"revision":"c8de2f70f69e7b8687b6bb010c383ca8","url":"text/suttas/SN/SN55_30.txt"},{"revision":"3ce5ec754d8004bc3fba7f00abb67d28","url":"text/suttas/SN/SN55_31.txt"},{"revision":"8a60ddcd453553f711307c999d2db530","url":"text/suttas/SN/SN55_32.txt"},{"revision":"69fd3866457f0417a0253b325cc1af18","url":"text/suttas/SN/SN55_33.txt"},{"revision":"e7dc7efbb2ce9112c830b49a0050c139","url":"text/suttas/SN/SN55_40.txt"},{"revision":"b070172020362cb2fa4495c6f6fa6cc3","url":"text/suttas/SN/SN55_5.txt"},{"revision":"6c9a624705d75fe057b9e6cb8935fabc","url":"text/suttas/SN/SN55_54.txt"},{"revision":"4838b2ee6c80ac3efbbdd0b89a7466db","url":"text/suttas/SN/SN55_7.txt"},{"revision":"e9e7cd69295c95eac29b8c64cd1f6286","url":"text/suttas/SN/SN56_1.txt"},{"revision":"b4e8b0ef22b5a180f12fbf01b867848c","url":"text/suttas/SN/SN56_102.txt"},{"revision":"23f9e706a9ceb87a01cabb25d99f82ee","url":"text/suttas/SN/SN56_11.txt"},{"revision":"337b986a6009cf171f335287a8dcb40e","url":"text/suttas/SN/SN56_2.txt"},{"revision":"1de423b38e2d38ef3359adb37926cc9a","url":"text/suttas/SN/SN56_20.txt"},{"revision":"5106eb2ec5f03d433e0310fd2d2d2720","url":"text/suttas/SN/SN56_26.txt"},{"revision":"5158679b051b9279dbc9f65eae7e3f32","url":"text/suttas/SN/SN56_27.txt"},{"revision":"fc1224e07591214842f9a7f2ad7c517a","url":"text/suttas/SN/SN56_28.txt"},{"revision":"ea32e89b08d2178eb08bc37e4fb7ded2","url":"text/suttas/SN/SN56_30.txt"},{"revision":"4b372ba80181af36a323beef23e95a77","url":"text/suttas/SN/SN56_31.txt"},{"revision":"78fa8da0409eec674e0e98150b9e8de1","url":"text/suttas/SN/SN56_32.txt"},{"revision":"6add86aabde0e5a7559b94129d7f54d4","url":"text/suttas/SN/SN56_35.txt"},{"revision":"1b6aef25831352eb440083faac8dc917","url":"text/suttas/SN/SN56_36.txt"},{"revision":"2d287a54487f22867e1cf8183e0b95bd","url":"text/suttas/SN/SN56_42.txt"},{"revision":"4d9184cbafb5886f225ed2a88120b8f4","url":"text/suttas/SN/SN56_44.txt"},{"revision":"e110e9191508114d2bb5e4af3cc5b3ab","url":"text/suttas/SN/SN56_45.txt"},{"revision":"7864efd17917e44d31a6e7895584477c","url":"text/suttas/SN/SN56_46.txt"},{"revision":"94e210fc6690b5c32ef58a110f5ae821","url":"text/suttas/SN/SN56_48.txt"},{"revision":"5b5e8a18be10a29992cd5aa8a71feef8","url":"text/suttas/SN/SN6_1.txt"},{"revision":"0e0c15c4e558bc52d753e21404794c5e","url":"text/suttas/SN/SN6_15.txt"},{"revision":"de4b794cc5361b3db78ef2485118f4ca","url":"text/suttas/SN/SN6_2.txt"},{"revision":"661604e880a411258194d094f8389b7a","url":"text/suttas/SN/SN7_12.txt"},{"revision":"a34daf17d54af377bc49d34137159b9e","url":"text/suttas/SN/SN7_14.txt"},{"revision":"b03509e9c1c0fc5faa24a475d0940ca6","url":"text/suttas/SN/SN7_16.txt"},{"revision":"fbe73367f1bbfb302439f6715b718d59","url":"text/suttas/SN/SN7_17.txt"},{"revision":"f85cfea4bfab34e80dc9fa47894c009d","url":"text/suttas/SN/SN7_18.txt"},{"revision":"99d0b7a1887ab47bd311dbb4e4121c05","url":"text/suttas/SN/SN7_2.txt"},{"revision":"cc1c97320db4bfa12f71bb6be38f5580","url":"text/suttas/SN/SN7_6.txt"},{"revision":"bbf6499cd6d760ce5a9d2e7f52d525c2","url":"text/suttas/SN/SN8_4.txt"},{"revision":"542c31ccf8f94ffe58da57f2ebcd05f0","url":"text/suttas/SN/SN9_1.txt"},{"revision":"e2de1e080694f69dcb28fe76cccbdc7a","url":"text/suttas/SN/SN9_11.txt"},{"revision":"1ecbc21da626cdb39320ad25efae78b2","url":"text/suttas/SN/SN9_14.txt"},{"revision":"db69b760b6be73c7e11517c0c59fa359","url":"text/suttas/SN/SN9_6.txt"},{"revision":"fb2b11399775d74cf4b22859fdd3b4b1","url":"text/suttas/SN/SN9_9.txt"}]);
  var RouteFactory = class {
    registerRouteJson;
    constructor(regRtJson) {
      this.registerRouteJson = regRtJson;
    }
    _createStrategy() {
      if (this.registerRouteJson.strategy.class_name === CACHEFIRST) {
        let args = this.registerRouteJson.strategy;
        let plugins = this._createPlugins();
        if (plugins.length > 0)
          args.plugins = plugins;
        return new CacheFirst({ cacheName: args.cacheName, plugins: args.plugins });
      }
      throw new Error("Currently only CacheFirst is supported");
    }
    _createPlugins() {
      let plugins = [];
      let pluginsList = [];
      if (this.registerRouteJson.strategy.plugins)
        pluginsList = this.registerRouteJson.strategy.plugins;
      for (let i = 0; i < pluginsList.length; i++) {
        if (pluginsList[i].class_name === CACHEABLERESPONSEPLUGIN)
          plugins.push(new CacheableResponsePlugin(pluginsList[i].options));
        else
          throw new Error("Only CacheableResponsePlugin is supported");
      }
      return plugins;
    }
    register() {
      const strategy = this._createStrategy();
      registerRoute(({ url }) => url.origin === this.registerRouteJson.url_origin, strategy);
    }
  };
  addEventListener("message", (event) => {
    if (event.data.type === REGISTERROUTE) {
      const regRouteMsg = event.data.payload;
      let dynRouteCreater = new RouteFactory(regRouteMsg);
      dynRouteCreater.register();
    }
  });
})();
