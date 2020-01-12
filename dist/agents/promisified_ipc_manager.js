"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var utilities_1 = require("../utilities/utilities");
/**
 * Convenience constructor
 * @param target the process / worker to which to attach the specialized listeners
 */
function manage(target, handlers) {
    return new PromisifiedIPCManager(target, handlers);
}
exports.manage = manage;
/**
 * This is a wrapper utility class that allows the caller process
 * to emit an event and return a promise that resolves when it and all
 * other processes listening to its emission of this event have completed.
 */
var PromisifiedIPCManager = /** @class */ (function () {
    function PromisifiedIPCManager(target, handlers) {
        var _this = this;
        this.pendingMessages = {};
        this.isDestroyed = false;
        /**
         * This routine uniquely identifies each message, then adds a general
         * message listener that waits for a response with the same id before resolving
         * the promise.
         */
        this.emit = function (name, args) { return __awaiter(_this, void 0, void 0, function () {
            var error;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.isDestroyed) {
                    error = { name: "FailedDispatch", message: "Cannot use a destroyed IPC manager to emit a message." };
                    return [2 /*return*/, { error: error }];
                }
                return [2 /*return*/, new Promise(function (resolve) {
                        var messageId = utilities_1.Utilities.guid();
                        var responseHandler = function (_a) {
                            var _b = _a.metadata, id = _b.id, isResponse = _b.isResponse, args = _a.args;
                            if (isResponse && id === messageId) {
                                _this.target.removeListener("message", responseHandler);
                                resolve(args);
                            }
                        };
                        _this.target.addListener("message", responseHandler);
                        var message = { name: name, args: args, metadata: { id: messageId, isResponse: false } };
                        if (!(_this.target.send && _this.target.send(message))) {
                            var error = { name: "FailedDispatch", message: "Either the target's send method was undefined or the act of sending failed." };
                            resolve({ error: error });
                            _this.target.removeListener("message", responseHandler);
                        }
                    })];
            });
        }); };
        /**
         * Invoked from either the parent or the child process, this allows
         * any unresolved promises to continue in the target process, but dispatches a dummy
         * completion response for each of the pending messages, allowing their
         * promises in the caller to resolve.
         */
        this.destroy = function () {
            var _a, _b;
            if (_this.callerIsTarget) {
                _this.destroyHelper();
            }
            else {
                (_b = (_a = _this.target).send) === null || _b === void 0 ? void 0 : _b.call(_a, { destroy: true });
            }
        };
        /**
         * Dispatches the dummy responses and sets the isDestroyed flag to true.
         */
        this.destroyHelper = function () {
            _this.isDestroyed = true;
            Object.keys(_this.pendingMessages).forEach(function (id) {
                var _a, _b;
                var error = { name: "ManagerDestroyed", message: "The IPC manager was destroyed before the response could be returned." };
                var message = { name: _this.pendingMessages[id], args: { error: error }, metadata: { id: id, isResponse: true } };
                (_b = (_a = _this.target).send) === null || _b === void 0 ? void 0 : _b.call(_a, message);
            });
        };
        /**
         * This routine receives a uniquely identified message. If the message is itself a response,
         * it is ignored to avoid infinite mutual responses. Otherwise, the routine awaits its completion using whatever
         * router the caller has installed, and then sends a response containing the original message id,
         * which will ultimately invoke the responseHandler of the original emission and resolve the
         * sender's promise.
         */
        this.generateInternalHandler = function (handlers) { return function (message) { return __awaiter(_this, void 0, void 0, function () {
            var name, args, metadata, id, error, results, registered, e_1, metadata_1, response, message_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = message.name, args = message.args, metadata = message.metadata;
                        if (!(name && metadata && !metadata.isResponse)) return [3 /*break*/, 6];
                        id = metadata.id;
                        this.pendingMessages[id] = name;
                        error = void 0;
                        results = void 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        registered = handlers[name];
                        if (!registered) return [3 /*break*/, 3];
                        return [4 /*yield*/, Promise.all(registered.map(function (handler) { return handler(args); }))];
                    case 2:
                        results = _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        error = e_1;
                        return [3 /*break*/, 5];
                    case 5:
                        if (!this.isDestroyed && this.target.send) {
                            metadata_1 = { id: id, isResponse: true };
                            response = { results: results, error: error };
                            message_1 = { name: name, args: response, metadata: metadata_1 };
                            delete this.pendingMessages[id];
                            this.target.send(message_1);
                        }
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        }); }; };
        this.target = target;
        if (handlers) {
            this.target.addListener("message", this.generateInternalHandler(handlers));
        }
        this.target.addListener("message", function (_a) {
            var destroy = _a.destroy;
            return destroy === true && _this.destroyHelper();
        });
    }
    Object.defineProperty(PromisifiedIPCManager.prototype, "callerIsTarget", {
        get: function () {
            return process.pid === this.target.pid;
        },
        enumerable: true,
        configurable: true
    });
    return PromisifiedIPCManager;
}());
exports.PromisifiedIPCManager = PromisifiedIPCManager;
