"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var cluster_1 = require("cluster");
var promisified_ipc_manager_1 = require("./promisified_ipc_manager");
var process_message_router_1 = require("./process_message_router");
var colors_1 = require("colors");
var request_promise_1 = require("request-promise");
var monitor_1 = require("./monitor");
/**
 * Effectively, each worker repairs the connection to the server by reintroducing a consistent state
 * if its predecessor has died. It itself also polls the server heartbeat, and exits with a notification
 * email if the server encounters an uncaught exception or if the server cannot be reached.
 */
var ServerWorker = /** @class */ (function (_super) {
    __extends(ServerWorker, _super);
    function ServerWorker(work) {
        var _this = _super.call(this) || this;
        _this.shouldServerBeResponsive = false;
        _this.exitHandlers = [];
        _this.pollingFailureCount = 0;
        _this.isInitialized = false;
        /**
         * Allows developers to invoke application specific logic
         * by hooking into the exiting of the server process.
         */
        _this.addExitHandler = function (handler) { return _this.exitHandlers.push(handler); };
        /**
         * Kill the session monitor (parent process) from this
         * server worker (child process). This will also kill
         * this process (child process).
         */
        _this.killSession = function (reason, graceful, errorCode) {
            if (graceful === void 0) { graceful = true; }
            if (errorCode === void 0) { errorCode = 0; }
            return _this.emit("kill", { reason: reason, graceful: graceful, errorCode: errorCode });
        };
        /**
         * A convenience wrapper to tell the session monitor (parent process)
         * to carry out the action with the specified message and arguments.
         */
        _this.emit = function (name, args) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, ServerWorker.IPCManager.emit(name, args)];
        }); }); };
        /**
         * Set up message and uncaught exception handlers for this
         * server process.
         */
        _this.configureInternalHandlers = function () {
            // updates the local values of variables to the those sent from master
            _this.on("updatePollingInterval", function (_a) {
                var newPollingIntervalSeconds = _a.newPollingIntervalSeconds;
                return _this.pollingIntervalSeconds = newPollingIntervalSeconds;
            });
            _this.on("manualExit", function (_a) {
                var isSessionEnd = _a.isSessionEnd;
                return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, ServerWorker.IPCManager.destroy()];
                            case 1:
                                _b.sent();
                                return [4 /*yield*/, this.executeExitHandlers(isSessionEnd)];
                            case 2:
                                _b.sent();
                                process.exit(0);
                                return [2 /*return*/];
                        }
                    });
                });
            });
            // one reason to exit, as the process might be in an inconsistent state after such an exception
            process.on('uncaughtException', _this.proactiveUnplannedExit);
            process.on('unhandledRejection', function (reason) {
                var appropriateError = reason instanceof Error ? reason : new Error("unhandled rejection: " + reason);
                _this.proactiveUnplannedExit(appropriateError);
            });
        };
        /**
         * Execute the list of functions registered to be called
         * whenever the process exits.
         */
        _this.executeExitHandlers = function (reason) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, Promise.all(this.exitHandlers.map(function (handler) { return handler(reason); }))];
        }); }); };
        /**
         * Notify master thread (which will log update in the console) of initialization via IPC.
         */
        _this.lifecycleNotification = function (event) { return _this.emit("lifecycle", { event: event }); };
        /**
         * Called whenever the process has a reason to terminate, either through an uncaught exception
         * in the process (potentially inconsistent state) or the server cannot be reached.
         */
        _this.proactiveUnplannedExit = function (error) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.shouldServerBeResponsive = false;
                        // communicates via IPC to the master thread that it should dispatch a crash notification email
                        this.emit(monitor_1.Monitor.IntrinsicEvents.CrashDetected, { error: error });
                        return [4 /*yield*/, this.executeExitHandlers(error)];
                    case 1:
                        _a.sent();
                        // notify master thread (which will log update in the console) of crash event via IPC
                        this.lifecycleNotification(colors_1.red("crash event detected @ " + new Date().toUTCString()));
                        this.lifecycleNotification(colors_1.red(error.message));
                        return [4 /*yield*/, ServerWorker.IPCManager.destroy()];
                    case 2:
                        _a.sent();
                        process.exit(1);
                        return [2 /*return*/];
                }
            });
        }); };
        /**
         * This monitors the health of the server by submitting a get request to whatever port / route specified
         * by the configuration every n seconds, where n is also given by the configuration.
         */
        _this.pollServer = function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve) {
                            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                var error_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, 3, 4]);
                                            return [4 /*yield*/, request_promise_1.get(this.pollTarget)];
                                        case 1:
                                            _a.sent();
                                            if (!this.shouldServerBeResponsive) {
                                                // notify monitor thread that the server is up and running
                                                this.lifecycleNotification(colors_1.green("listening on " + this.serverPort + "..."));
                                                this.emit(monitor_1.Monitor.IntrinsicEvents.ServerRunning, { isFirstTime: !this.isInitialized });
                                                this.isInitialized = true;
                                            }
                                            this.shouldServerBeResponsive = true;
                                            return [3 /*break*/, 4];
                                        case 2:
                                            error_1 = _a.sent();
                                            // if we expect the server to be unavailable, i.e. during compilation,
                                            // the listening variable is false, activeExit will return early and the child
                                            // process will continue
                                            if (this.shouldServerBeResponsive) {
                                                if (++this.pollingFailureCount > this.pollingFailureTolerance) {
                                                    this.proactiveUnplannedExit(error_1);
                                                }
                                                else {
                                                    this.lifecycleNotification(colors_1.yellow("the server has encountered " + this.pollingFailureCount + " of " + this.pollingFailureTolerance + " tolerable failures"));
                                                }
                                            }
                                            return [3 /*break*/, 4];
                                        case 3:
                                            resolve();
                                            return [7 /*endfinally*/];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); }, 1000 * _this.pollingIntervalSeconds);
                        })];
                    case 1:
                        _a.sent();
                        // controlled, asynchronous infinite recursion achieves a persistent poll that does not submit a new request until the previous has completed
                        this.pollServer();
                        return [2 /*return*/];
                }
            });
        }); };
        _this.configureInternalHandlers();
        ServerWorker.IPCManager = promisified_ipc_manager_1.manage(process, _this.handlers);
        _this.lifecycleNotification(colors_1.green("initializing process... " + colors_1.white("[" + process.execPath + " " + process.execArgv.join(" ") + "]")));
        var _a = process.env, pollingRoute = _a.pollingRoute, serverPort = _a.serverPort, pollingIntervalSeconds = _a.pollingIntervalSeconds, pollingFailureTolerance = _a.pollingFailureTolerance;
        _this.serverPort = Number(serverPort);
        _this.pollingIntervalSeconds = Number(pollingIntervalSeconds);
        _this.pollingFailureTolerance = Number(pollingFailureTolerance);
        _this.pollTarget = "http://localhost:" + serverPort + pollingRoute;
        work();
        _this.pollServer();
        return _this;
    }
    ServerWorker.Create = function (work) {
        if (cluster_1.isMaster) {
            console.error(colors_1.red("cannot create a worker on the monitor process."));
            process.exit(1);
        }
        else if (++ServerWorker.count > 1) {
            ServerWorker.IPCManager.emit("kill", {
                reason: "cannot create more than one worker on a given worker process.",
                graceful: false,
                errorCode: 1
            });
            process.exit(1);
        }
        else {
            return new ServerWorker(work);
        }
    };
    ServerWorker.count = 0;
    return ServerWorker;
}(process_message_router_1.default));
exports.ServerWorker = ServerWorker;
