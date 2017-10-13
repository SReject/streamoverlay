(function(){
    const owns = Object.prototype.hasOwnProperty;

    // Deep freezing function
    const freeze = (config, key, value) => {
        if (value === undefined) {
            return;

        } else if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
            Object.defineProperty(config, key, { enumerable: true, value: value });

        } else if (Array.isArray(value)) {
            let nConfig = [];
            value.forEach((val, idx) => {
                freeze(nConfig, idx, val);
            });
            Object.freeze(nConfig);
            Object.defineProperty(config, key, { enumerable: true, value: nConfig });

        } else {
            let nConfig = Object.create(null);
            Object.keys(value).forEach((key) => {
                freeze(nConfig, key, value[key]);
            });
            Object.defineProperty(config, key, { enumerable: true, value: nConfig });
        }
    };

    // Check if the stream-overlay config is defined
    let config = Object.create(null);
    if (typeof streamOverlayConfig !== 'object') {
        console.error('[StreamOverlay] Invalid overlay config');
        throw new Error('Invalid overlay config');

    // Deep freeze the config
    } else {
        console.log('[StreamOverlay] Deep Freezing config');
        Object.keys(streamOverlayConfig).forEach(key => {
            freeze(config, key, streamOverlayConfig[key]);
        });
        Object.freeze(config);
        console.log('[StreamOverlay] Config frozen');
        delete window.streamOverlayConfig;
    }

    // inherfit from CustomEventEmitter
    const streamOverlay = Object.create(CustomEventEmitter.prototype);
    CustomEventEmitter.call(streamOverlay);

    // store the config
    Object.defineProperty(streamOverlay, 'config', { enumerable: true, value: config });

    // util functions container
    Object.defineProperty(streamOverlay, 'util', {enumerable: true, value: {}});

    // CustomEventEmitter Class
    Object.defineProperty(streamOverlay.util, 'CustomEventEmitter', {
        enumerable: true,
        value: CustomEventEmitter
    });

    // returns true if the object has the specified property
    Object.defineProperty(streamOverlay.util, 'owns', {
        enumerable: true,
        value: (object, property) => {
            return owns.call(object, property);
        }
    });

    // suquentally walks the input target's properties based on the specified paths
    Object.defineProperty(streamOverlay.util, 'walk', {
        enumerable: true,
        value: (target, ...path) => {
            path = Array.from(path);
            while (streamOverlay.util.owns(target, path[0])) {
                target = target[path.shift()];
            }
            return path.length ? undefined : target;
        }
    });

    // Attempts to load the specified stylesheet, returns a promise
    Object.defineProperty(streamOverlay.util, 'loadStyleSheet', {
        enumerable: true,
        value: (href) => new Promise((res, rej) => {
            let linkEle = document.createElement('link');
            linkEle.setAttribute('rel', 'stylesheet');
            linkEle.setAttribute('href', href);
            linkEle.onerror = ()=>{
                linkEle.onerror = null;
                linkEle.onload = null;
                linkEle.remove();
                rej(new Error('Failed to load'));
            };
            linkEle.onload = (linkEle)=>{
                linkEle.onerror = null;
                linkEle.onload = null;
                res();
            };
            document.head.appendChild(linkEle);
        })
    });

    // Performs an XHR request, returns a promise
    Object.defineProperty(streamOverlay.util, 'request', {
        enumerable: true,
        value: (method, uri, headers, data) => {
            let resolver,
                rejector,
                xhr;
            const requester = new Promise((resolve, reject) => {
                resolver = resolve;
                rejector = reject;
                xhr      = new XMLHttpRequest();
                xhr.open(method || "GET", uri, true);
                (headers || []).forEach((header) => {
                    xhr.setRequestHeader(header[0], header[1]);
                });
                xhr.onerror = () => {
                    xhr.onerror            = null;
                    xhr.onreadystatechange = null;
                    rejector(xhr);
                };
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        xhr.onerror            = null;
                        xhr.onreadystatechange = null;
                        resolve(xhr);
                    }
                };
                xhr.send(data);
            });
            Object.defineProperties(requester, {
                abort: {
                    enumerable: true,
                    value: (err) => {
                        xhr.abort();
                        rejector(err);
                    }
                },
                status: {
                    enumerable: true,
                    get: () => xhr.status
                },
                readyState: {
                    enumerable: true,
                    get: () => xhr.readyState
                },
                responseText: {
                    enumerable: true,
                    get: () => xhr.responseText
                },
                responseXML: {
                    enumerable: true,
                    get: () => xhr.responseXML
                },
                request: {
                    enumerable: true,
                    get: () => xhr
                }
            });
            return requester;
        }
    });

    // returns true if the input is a callable function
    Object.defineProperty(streamOverlay.util, 'isCallable', {
        enumerable: true,
        value: (()=>{
            /* is-callable
               https://raw.githubusercontent.com/ljharb/is-callable/a7ca20d7d1be6afd00f136603c4aaa0dfbc6db2d/index.js
               License: MIT - Copyright (c) 2015 Jordan Harband - Edits by SReject
                   https://raw.githubusercontent.com/ljharb/is-callable/0dc214493bf4aee63fc0b825a9823e0702d6d610/LICENSE
            */
            'use strict';
            var toStr = Object.prototype.toString,
                fnToStr = Function.prototype.toString,
                constructorRegex = /^\s*class /,
                isES6ClassFn = function (value) {
                    try {
                        var fnStr = fnToStr.call(value);
                        return constructorRegex.test(fnStr.replace(/\/\/.*\n/g, '').replace(/\/\*[.\s\S]*\*\//g, '').replace(/\n/mg, ' ').replace(/ {2}/g, ' '));
                    } catch (e) {
                        return false;
                    }
                },
                tryFunctionObject = function (value) {
                    try {
                        fnToStr.call(value);
                        return true;
                    } catch (e) {
                        return false;
                    }
                },
                hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
            return function isCallable(value) {
                if (!value || typeof value !== 'function' && typeof value !== 'object' || isES6ClassFn(value)) { return false; }
                if (hasToStringTag) { return tryFunctionObject(value); }
                var strClass = toStr.call(value);
                return strClass === '[object Function]' || strClass === '[object GeneratorFunction]'
            }
        })()
    });

    Object.defineProperty(streamOverlay, 'mixer', {enumerable: true, value: Object.create(null)});

    Object.defineProperties(streamOverlay.mixer, {
        clientid: {
            enumerable: true,
            value: '3e3a22e2811b3022232167542a371b3273547042d4bbccac'
        },
        uris: {
            enumerable: true,
            value: Object.create(null, {
                apibase: {
                    enumerable: true,
                    value: 'https://mixer.com/api/v1/'
                },
                oauthshortcode: {
                    enumerable: true,
                    value: 'https://mixer.com/api/v1/oauth/shortcode'
                },
                oauthshortcodecheck: {
                    enumerable: true,
                    value: 'https://mixer.com/api/v1/oauth/shortcode/check/'
                },
                oauthtokenexchange: {
                    enumerable: true,
                    value: 'https://mixer.com/api/v1/oauth/token'
                },
                realtime: {
                    enumerable: true,
                    value: 'wss://constellation.mixer.com'
                }
            })
        },
        getShortCode: {
            enumerable: true,
            value: (scopes) => {
                const mixer = streamOverlay.mixer;
                if (typeof scopes === 'string') {
                    scopes = scopes.split(' ');
                } else if (Array.isArray(scopes)) {
                    scopes = scopes;
                } else {
                    throw new TypeError('INVALID_SCOPES_LIST');
                }
                scopes = scopes.join('%20');
                return new Promise((resolve, reject) => {
                    streamOverlay.util.request(
                        'POST',
                        mixer.uris.oauthshortcode,
                        [['content-type', 'application/x-www-form-urlencoded']],
                        `client_id=${mixer.clientid}&scope=${scopes}`

                    ).then((req) => {
                        if (req.status !== 200) {
                            return reject(new Error(`Mixer returned a ${req.status} error`));

                        } else if (!req.responseText) {
                            return reject(new Error('Mixer returned empty response'));

                        } else {
                            try {
                                let res = JSON.parse(req.responseText);
                                if (!streamOverlay.util.owns(res, 'code') || typeof res.code !== 'string' || res.code === "") {
                                    throw new Error('Mixer returned invalid code');
                                }
                                if (!streamOverlay.util.owns(res, 'handle') || typeof res.handle !== 'string' || res.handle === "") {
                                    throw new Error('Mixer returned invalid handle');
                                }
                                if (!streamOverlay.util.owns(res, 'expires_in') || typeof res.expires_in !== 'number' || res.expires_in === NaN || res.expires_in === Infinity || parseInt(res.expires_in, 10) !== res.expires_in) {
                                    throw new Error('Mixer returned invalid expiration time');
                                }
                                resolve({
                                    handle: res.handle,
                                    code:   res.code,
                                    expires: Date.now() + (res.expires_in * 1000)
                                });
                            } catch (e) {
                                return reject(e);
                            }
                        }
                    }).catch((err) => {
                        reject(err);
                    });
                });
            }
        },
        pollForAuth: {
            enumerable: true,
            value: (handle, expiration) => {
                if (typeof handle !== 'string' || handle === "") {
                    throw new Error('invalid handle')
                }
                if (typeof expiration !== 'number' || expiration === NaN || expiration === Infinity || parseInt(expiration, 10) !== expiration) {
                    throw new Error('invalid expiration');
                }
                const mixer = streamOverlay.mixer;
                let cancelled = false,
                    pollid,
                    resolve,
                    reject;
                const poll = () => {
                    pollid = null;
                    if (cancelled) {
                        reject(new Error('cancelled'));
                    } else if (expiration <= Date.now()) {
                        reject(new Error('Authorization Code Expired'));
                    } else {
                        streamOverlay.util.request(
                            "GET",
                            `${mixer.uris.oauthshortcodecheck}${handle}?clientid=${mixer.clientid}`
                        ).then((req) => {
                            if (cancelled) {
                                reject(new Error('cancelled'));

                            } else if (req.status === 204) {
                                pollid = setTimeout(poll, 5000);

                            } else if (req.status === 403) {
                                reject(new Error('User denied authorization'));

                            } else if (req.status === 404) {
                                reject(new Error('code expired or invalid handle or invalid clientid'));

                            } else if (req.status !== 200) {
                                reject(new Error(`Mixer returned unknown status code ${req.status}`));

                            } else {
                                try {
                                    let res = JSON.parse(req.responseText);
                                    if (typeof res.code !== 'string' || res.code === "") {
                                        reject(new Error('Mixer returned invalid code'));
                                    } else {
                                        resolve(res.code);
                                    }
                                } catch (err) {
                                    reject(err);
                                }
                            }
                        }).catch((err) => {
                            reject(err);
                        });
                    }
                };
                const prom = new Promise((resolver, rejecter) => {
                    resolve = resolver;
                    reject  = rejecter;
                    poll();
                });
                Object.defineProperties(prom, {
                    cancel:{
                        enumerable: true,
                        value: () => {
                            if (!cancelled) {
                                if (pollid) {
                                    clearTimeout(pollid);
                                    pollid = null;
                                    reject(new Error('cancelled'));
                                }
                                cancel = true;
                            }
                        }
                    },
                    pollid:{
                        enumerable: true,
                        get: () => pollid
                    }
                });
                return prom;
            }
        },
        getTokenFromCode: {
            enumerable: true,
            value: (code) => {
                if (typeof code !== 'string' || code === "") {
                    throw new Error('Mixer returned invalid code');
                }
                const mixer = streamOverlay.mixer;
                return new Promise((resolve, reject) => {
                    streamOverlay.util.request(
                        'POST',
                        mixer.uris.oauthtokenexchange,
                         [['content-type', 'application/x-www-form-urlencoded']],
                        `grant_type=authorization_code&client_id=${mixer.clientid}&code=${code}`

                    ).then((req) => {
                        if (req.status !== 200) {
                            reject(new Error(`Mixer returned status error: ${req.status}`));

                        } else if (req.responseText === '') {
                            reject(new Error('Mixer returned empty response'));

                        } else {
                            try {
                                let res = JSON.parse(req.responseText);
                                if (res.token_type !== 'Bearer') {
                                    reject(new Error('Mixer returned until authorization token type'));

                                } else if (typeof res.access_token !== 'string' || res.access_token === '') {
                                    reject(new Error('Mixer returned invalid access token'));

                                } else if (typeof res.refresh_token !== 'string' || res.refresh_token === '') {
                                    reject(new Error('Mixer returned invalid refresh token'));

                                } else if (
                                    typeof res.expires_in !== 'number' ||
                                    res.expires_in === NaN ||
                                    res.expires_in === Infinity ||
                                    parseInt(res.expires_in,10) !== res.expires_in
                                ) {
                                    reject(new Error('Mixer returned invalid expiration time'));

                                } else {
                                    resolve({
                                        type: 'Bearer',
                                        token: res.access_token,
                                        refresh: res.refresh_token,
                                        created: Date.now(),
                                        expiration: res.expires_in * 1000
                                    });
                                }
                            } catch(err) {
                                console.log(err);
                                reject(err);
                            }
                        }
                    }).catch((err) => {
                        console.log(err);
                        reject(err);
                    });
                });
            }
        },
        refreshOAuthToken: {
            enumerable: true,
            value: (refreshtoken) => {
                const mixer = streamOverlay.mixer;
                return new Promise((resolve, reject) => {
                    streamOverlay.util.request(
                        'POST',
                        mixer.uris.oauthtokenexchange,
                        [['content-type', 'application/x-www-form-urlencoded']],
                        `grant_type=refresh_token&refresh_token=${refreshtoken}&client_id=${mixer.clientid}`
                    )
                    .then((req) => {
                        if (req.status !== 200) {
                            reject(new Error('REFRESH_FAILED'));
                        } else {
                            let res = JSON.parse(req.responseText);
                            resolve({
                                type: 'Bearer',
                                token: res.access_token,
                                refresh: res.refresh_token,
                                created: Date.now(),
                                expiration: res.expires_in * 1000
                            });
                        }
                    })
                    .catch((err) => {
                        reject(err);
                    });
                });
            }
        }
    });



    // add the streamoverlay object to the window
    Object.defineProperty(window, 'streamOverlay', {enumerable: true, value: streamOverlay});
}());
