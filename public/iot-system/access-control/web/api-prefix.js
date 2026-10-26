/**
 * ACCESS Professional - Host Prefix Shim
 *
 * Automatically routes all console `/api/...` fetch and EventSource requests
 * to `/api/iot-system/access/...` so it talks to the Next.js gateway proxy.
 */
(function () {
    'use strict';

    var API_PREFIX = '/api/iot-system/access';
    var API_ROOT = '/api/';

    function mapUrl(input) {
        var raw = (typeof input === 'string') ? input : (input && typeof input.url === 'string' ? input.url : null);
        if (!raw) return input;

        var parsed;
        try {
            parsed = new URL(raw, window.location.href);
        } catch (e) {
            return input;
        }

        if (parsed.origin !== window.location.origin) return input;
        if (parsed.pathname.indexOf(API_ROOT) !== 0) return input;
        if (parsed.pathname.indexOf(API_PREFIX + '/') === 0) return input;

        parsed.pathname = API_PREFIX + '/' + parsed.pathname.slice(API_ROOT.length);
        return typeof input === 'string' ? parsed.toString() : parsed.toString();
    }

    var nativeFetch = (typeof window.fetch === 'function') ? window.fetch.bind(window) : null;

    if (nativeFetch) {
        window.fetch = function (input, init) {
            if (typeof input === 'string') {
                return nativeFetch(mapUrl(input), init);
            }

            if (input && typeof input === 'object' && typeof input.url === 'string') {
                var mapped = mapUrl(input);
                if (mapped !== input.url) {
                    try {
                        input = new Request(mapped, input);
                    } catch (e) {
                        return nativeFetch(mapped, init || input);
                    }
                }
            }

            return nativeFetch(input, init);
        };
    }

    var NativeEventSource = window.EventSource;

    if (typeof NativeEventSource === 'function') {
        function PrefixedEventSource(url, config) {
            return new NativeEventSource(mapUrl(url), config);
        }
        PrefixedEventSource.prototype = NativeEventSource.prototype;
        PrefixedEventSource.CONNECTING = NativeEventSource.CONNECTING;
        PrefixedEventSource.OPEN = NativeEventSource.OPEN;
        PrefixedEventSource.CLOSED = NativeEventSource.CLOSED;
        window.EventSource = PrefixedEventSource;
    }
})();
