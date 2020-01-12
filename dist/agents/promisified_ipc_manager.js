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
function IPC_Promisify(target, handlers) {
    return new PromisifiedIPCManager(target, handlers);
}
exports.IPC_Promisify = IPC_Promisify;
;
/**
 * This is a wrapper utility class that allows the caller process
 * to emit an event and return a promise that resolves when it and all
 * other processes listening to its emission of this event have completed.
 */
var PromisifiedIPCManager = /** @class */ (function () {
    function PromisifiedIPCManager(target, handlers) {
        var _this = this;
        /**
         * A convenience wrapper around the standard process emission.
         * Does not wait for a response.
         */
        this.emit = function (name, args) { return __awaiter(_this, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
            return [2 /*return*/, (_b = (_a = this.target).send) === null || _b === void 0 ? void 0 : _b.call(_a, { name: name, args: args })];
        }); }); };
        /**
         * This routine uniquely identifies each message, then adds a general
         * message listener that waits for a response with the same id before resolving
         * the promise.
         */
        this.emitPromise = function (name, args) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var _a, _b;
                        var messageId = utilities_1.Utilities.guid();
                        var responseHandler = function (_a) {
                            var _b = _a.metadata, id = _b.id, isResponse = _b.isResponse, args = _a.args;
                            if (isResponse && id === messageId) {
                                _this.target.removeListener("message", responseHandler);
                                resolve(args);
                            }
                        };
                        _this.target.addListener("message", responseHandler);
                        var message = { name: name, args: args, metadata: { id: messageId } };
                        (_b = (_a = _this.target).send) === null || _b === void 0 ? void 0 : _b.call(_a, message);
                    })];
            });
        }); };
        /**
         * This routine receives a uniquely identified message. If the message is itself a response,
         * it is ignored to avoid infinite mutual responses. Otherwise, the routine awaits its completion using whatever
         * router the caller has installed, and then sends a response containing the original message id,
         * which will ultimately invoke the responseHandler of the original emission and resolve the
         * sender's promise.
         */
        this.internalHandler = function (handlers) { return function (_a) {
            var name = _a.name, args = _a.args, metadata = _a.metadata;
            return __awaiter(_this, void 0, void 0, function () {
                var error, results, registered, e_1, response;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!(name && (!metadata || !metadata.isResponse))) return [3 /*break*/, 6];
                            error = void 0;
                            results = void 0;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 4, , 5]);
                            registered = handlers[name];
                            if (!registered) return [3 /*break*/, 3];
                            return [4 /*yield*/, Promise.all(registered.map(function (handler) { return handler(args); }))];
                        case 2:
                            results = _b.sent();
                            _b.label = 3;
                        case 3: return [3 /*break*/, 5];
                        case 4:
                            e_1 = _b.sent();
                            error = e_1;
                            return [3 /*break*/, 5];
                        case 5:
                            if (metadata && this.target.send) {
                                metadata.isResponse = true;
                                response = { results: results, error: error };
                                this.target.send({ name: name, args: response, metadata: metadata });
                            }
                            _b.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        }; };
        this.target = target;
        if (handlers) {
            this.target.addListener("message", this.internalHandler(handlers));
        }
    }
    return PromisifiedIPCManager;
}());
exports.PromisifiedIPCManager = PromisifiedIPCManager;
