(function (isCallable) {
    const owns = Object.prototype.hasOwnProperty;

    function CustomEvent(target, event, cancelable) {
        Object.defineProperties(this, {
            bubbles:{ enumerable: true, value: false },
            currentTarget: { enumerable: true, value: target },
            target: { enumerable: true, value: target },
            scoped: { enumerable: true, value: false },
            composed: { enumerable: true, value: false },
            eventPhase: { enumerable: true, value: 2 },
            isTrusted: { enumerable: true, value: false },
            canceled: { writable: true, enumerable: true, value: false }
        });
        if (typeof event === "string") {
            if (event === "") {
                throw new TypeError("event cannot be an empty string");
            }
            Object.defineProperties(this, {
                type: { enumerable: true, value: event },
                cancelable: { enumerable: true, value: cancelable = !!(cancelable) }
            });
        } else {
            Object.defineProperties(this, {
                type: { enumerable: true, value: event.type },
                cancelable: { enumerable: true, value: cancelable = event.cancelable }
            });
        }
        if (!cancelable) {
            Object.defineProperty(this, 'canceled', { writable: false });
        }
    }
    Object.defineProperty(CustomEvent.prototype, 'stopPropagation', {
        enumerable: true,
        value: function stopPropagation() {
            if (this.cancelable && !this.canceled) {
                Object.defineProperty(this, 'canceled', { writable: false, value: true });
            }
        }
    });
    Object.defineProperty(CustomEvent.prototype, 'stopImmediatePropagation', {
        enumerable: true,
        value: function stopImmediatePropagation() {
            this.stopPropagation();
        }
    });
    function CustomEventEmitter() {
        Object.defineProperty(this, 'eventHandlers', { value: {} });
    }
    Object.defineProperty(CustomEventEmitter.prototype, 'addEventListener', {
        enumerable: true,
        value: function addEventListener(type, handler, once) {
            if (typeof type !== 'string' || type == '') {
                throw new Error('invalid event type');

            } else if (!isCallable(handler)) {
                throw new TypeError('eventer handler is not a function');
            }
            if (!owns.call(this.eventHandlers, type)) {
                this.eventHandlers[type] = [];
            }
            this.eventHandlers[type].push({
                callback: handler,
                once: once
            });
        }
    });
    Object.defineProperty(CustomEventEmitter.prototype, 'removeEventListener', {
        enumerable: true,
        value: function addEventListener(type, handler, once) {
            if (typeof type !== 'string' || type == '') {
                throw new Error('invalid event type');
            } else if (!isCallable(handler)) {
                throw new TypeError('eventer handler is not a function');
            } else if (owns.call(this.eventHandlers, type)) {
                this.eventHandlers[type].find( (listener, idx) => {
                    if (listener.callback === handler && listener.once && once == listener.once) {
                        this.eventHandlers.splice(idx, 1);
                        return true;
                    }
                });
            }
        }
    });
    Object.defineProperty(CustomEventEmitter.prototype, 'dispatchEvent', {
        enumerable: true,
        value: function dispatchEvent() {
            let args = Array.from(arguments),
                event = args[0];
            if (typeof args[0] === "string") {
                event = new CustomEvent(this, args[0], { cancelable: args.length > 1 && args[1] });
                args.splice(1,1);
            } else if (event instanceof Event) {
                event = new CustomEvent(this, args[0]);
            } else if (!(event instanceof CustomEvent)) {
                throw new TypeError("Invalid event");
            }
            if (!owns.call(this.eventHandlers, event.type)) {
                return;
            }

            event.data = args[1];
            let handlers = this.eventHandlers[event.type],
                idx = 0;
            setTimeout(function() {
                while (idx < handlers.length) {
                    handlers[idx].callback(event);
                    if (handlers[idx].once) {
                        handlers.splice(idx, 1);
                    } else {
                        idx += 1;
                    }
                    if (event.canceled) {
                        break;
                    }
                }
            },0);
        }
    });
    Object.defineProperty(window, 'CustomEventEmitter', {
        enumerable: true,
        value: CustomEventEmitter
    });
}(function () {
    /* is-callable
       https://raw.githubusercontent.com/ljharb/is-callable/a7ca20d7d1be6afd00f136603c4aaa0dfbc6db2d/index.js
       License: MIT - Copyright (c) 2015 Jordan Harband - Edits by SReject
           https://raw.githubusercontent.com/ljharb/is-callable/0dc214493bf4aee63fc0b825a9823e0702d6d610/LICENSE
    */
    'use strict';
    var toStr = Object.prototype.toString,
        fnToStr = Function.prototype.toString,
        fnClass = '[object Function]',
        genClass = '[object GeneratorFunction]',
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
        return strClass === fnClass || strClass === genClass;
    };
}()));
