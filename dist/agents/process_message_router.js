"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IPCMessageReceiver = /** @class */ (function () {
    function IPCMessageReceiver() {
        var _this = this;
        this.handlers = {};
        /**
         * Add a listener at this message. When the monitor process
         * receives a message, it will invoke all registered functions.
         */
        this.on = function (name, handler) {
            var handlers = _this.handlers[name];
            if (!handlers) {
                _this.handlers[name] = [handler];
            }
            else {
                handlers.push(handler);
            }
        };
        /**
         * Unregister a given listener at this message.
         */
        this.off = function (name, handler) {
            var handlers = _this.handlers[name];
            if (handlers) {
                var index = handlers.indexOf(handler);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
            }
        };
        /**
         * Unregister all listeners at this message.
         */
        this.clearMessageListeners = function () {
            var names = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                names[_i] = arguments[_i];
            }
            return names.map(function (name) { return delete _this.handlers[name]; });
        };
    }
    return IPCMessageReceiver;
}());
exports.default = IPCMessageReceiver;
