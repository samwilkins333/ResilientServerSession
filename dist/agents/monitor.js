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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var session_config_1 = require("../utilities/session_config");
var repl_1 = require("../utilities/repl");
var cluster_1 = require("cluster");
var promisified_ipc_manager_1 = require("./promisified_ipc_manager");
var colors_1 = require("colors");
var child_process_1 = require("child_process");
var jsonschema_1 = require("jsonschema");
var utilities_1 = require("../utilities/utilities");
var fs_1 = require("fs");
var process_message_router_1 = require("./process_message_router");
var server_worker_1 = require("./server_worker");
/**
 * Validates and reads the configuration file, accordingly builds a child process factory
 * and spawns off an initial process that will respawn as predecessors die.
 */
var Monitor = /** @class */ (function (_super) {
    __extends(Monitor, _super);
    function Monitor(sessionKey) {
        var _this = _super.call(this) || this;
        _this.finalized = false;
        _this.exitHandlers = [];
        _this.initialize = function (sessionKey) {
            console.log(_this.timestamp(), colors_1.cyan("initializing session..."));
            _this.key = sessionKey;
            // determines whether or not we see the compilation / initialization / runtime output of each child server process
            var output = _this.config.showServerOutput ? "inherit" : "ignore";
            cluster_1.setupMaster({ stdio: ["ignore", output, output, "ipc"] });
            // handle exceptions in the master thread - there shouldn't be many of these
            // the IPC (inter process communication) channel closed exception can't seem
            // to be caught in a try catch, and is inconsequential, so it is ignored
            process.on("uncaughtException", function (_a) {
                var message = _a.message, stack = _a.stack;
                if (message !== "Channel closed") {
                    _this.mainLog(colors_1.red(message));
                    if (stack) {
                        _this.mainLog("uncaught exception\n" + colors_1.red(stack));
                    }
                }
            });
            // a helpful cluster event called on the master thread each time a child process exits
            cluster_1.on("exit", function (_a, code, signal) {
                var pid = _a.process.pid;
                var prompt = "server worker with process id " + pid + " has exited with code " + code + (signal === null ? "" : ", having encountered signal " + signal) + ".";
                _this.mainLog(colors_1.cyan(prompt));
                // to make this a robust, continuous session, every time a child process dies, we immediately spawn a new one
                _this.spawn();
            });
        };
        _this.finalize = function () {
            if (_this.finalized) {
                throw new Error("Session monitor is already finalized");
            }
            _this.finalized = true;
            _this.spawn();
        };
        _this.coreHooks = Object.freeze({
            onCrashDetected: function (listener) { return _this.on(Monitor.IntrinsicEvents.CrashDetected, listener); },
            onServerRunning: function (listener) { return _this.on(Monitor.IntrinsicEvents.ServerRunning, listener); }
        });
        /**
         * Kill this session and its active child
         * server process, either gracefully (may wait
         * indefinitely, but at least allows active networking
         * requests to complete) or immediately.
         */
        _this.killSession = function (reason, graceful, errorCode) {
            if (graceful === void 0) { graceful = true; }
            if (errorCode === void 0) { errorCode = 0; }
            return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.mainLog(colors_1.cyan("exiting session " + (graceful ? "clean" : "immediate") + "ly"));
                            this.mainLog("session exit reason: " + (colors_1.red(reason)));
                            return [4 /*yield*/, this.executeExitHandlers(true)];
                        case 1:
                            _a.sent();
                            this.killActiveWorker(graceful, true);
                            process.exit(errorCode);
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Execute the list of functions registered to be called
         * whenever the process exits.
         */
        _this.addExitHandler = function (handler) { return _this.exitHandlers.push(handler); };
        /**
         * Extend the default repl by adding in custom commands
         * that can invoke application logic external to this module
         */
        _this.addReplCommand = function (basename, argPatterns, action) {
            _this.repl.registerCommand(basename, argPatterns, action);
        };
        _this.exec = function (command, options) {
            return new Promise(function (resolve) {
                child_process_1.exec(command, __assign(__assign({}, options), { encoding: "utf8" }), function (error, stdout, stderr) {
                    if (error) {
                        _this.execLog(colors_1.red("unable to execute " + colors_1.white(command)));
                        error.message.split("\n").forEach(function (line) { return line.length && _this.execLog(colors_1.red("(error) " + line)); });
                    }
                    else {
                        var outLines = void 0, errorLines = void 0;
                        if ((outLines = stdout.split("\n").filter(function (line) { return line.length; })).length) {
                            outLines.forEach(function (line) { return line.length && _this.execLog(colors_1.cyan("(stdout) " + line)); });
                        }
                        if ((errorLines = stderr.split("\n").filter(function (line) { return line.length; })).length) {
                            errorLines.forEach(function (line) { return line.length && _this.execLog(colors_1.yellow("(stderr) " + line)); });
                        }
                    }
                    resolve();
                });
            });
        };
        /**
         * Generates a blue UTC string associated with the time
         * of invocation.
         */
        _this.timestamp = function () { return colors_1.blue("[" + new Date().toUTCString() + "]"); };
        /**
         * A formatted, identified and timestamped log in color
         */
        _this.mainLog = function () {
            var optionalParams = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                optionalParams[_i] = arguments[_i];
            }
            console.log.apply(console, __spreadArrays([_this.timestamp(), _this.config.identifiers.master.text], optionalParams));
        };
        /**
         * A formatted, identified and timestamped log in color for non-
         */
        _this.execLog = function () {
            var optionalParams = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                optionalParams[_i] = arguments[_i];
            }
            console.log.apply(console, __spreadArrays([_this.timestamp(), _this.config.identifiers.exec.text], optionalParams));
        };
        /**
         * Reads in configuration .json file only once, in the master thread
         * and pass down any variables the pertinent to the child processes as environment variables.
         */
        _this.loadAndValidateConfiguration = function () {
            var config;
            try {
                console.log(_this.timestamp(), colors_1.cyan("validating configuration..."));
                config = JSON.parse(fs_1.readFileSync('./session.config.json', 'utf8'));
                var options = {
                    throwError: true,
                    allowUnknownAttributes: false
                };
                // ensure all necessary and no excess information is specified by the configuration file
                jsonschema_1.validate(config, session_config_1.configurationSchema, options);
                config = utilities_1.Utilities.preciseAssign({}, session_config_1.defaultConfig, config);
            }
            catch (error) {
                if (error instanceof jsonschema_1.ValidationError) {
                    console.log(colors_1.red("\nSession configuration failed."));
                    console.log("The given session.config.json configuration file is invalid.");
                    console.log(error.instance + ": " + error.stack);
                    process.exit(0);
                }
                else if (error.code === "ENOENT" && error.path === "./session.config.json") {
                    console.log(colors_1.cyan("Loading default session parameters..."));
                    console.log("Consider including a session.config.json configuration file in your project root for customization.");
                    config = utilities_1.Utilities.preciseAssign({}, session_config_1.defaultConfig);
                }
                else {
                    console.log(colors_1.red("\nSession configuration failed."));
                    console.log("The following unknown error occurred during configuration.");
                    console.log(error.stack);
                    process.exit(0);
                }
            }
            finally {
                var identifiers_1 = config.identifiers;
                Object.keys(identifiers_1).forEach(function (key) {
                    var resolved = key;
                    var _a = identifiers_1[resolved], text = _a.text, color = _a.color;
                    identifiers_1[resolved].text = (session_config_1.colorMapping.get(color) || colors_1.white)(text + ":");
                });
                return config;
            }
        };
        /**
         * Builds the repl that allows the following commands to be typed into stdin of the master thread.
         */
        _this.initializeRepl = function () {
            var repl = new repl_1.default({ identifier: function () { return _this.timestamp() + " " + _this.config.identifiers.master.text; } });
            var boolean = /true|false/;
            var number = /\d+/;
            var letters = /[a-zA-Z]+/;
            repl.registerCommand("exit", [/clean|force/], function (args) { return _this.killSession("manual exit requested by repl", args[0] === "clean", 0); });
            repl.registerCommand("restart", [/clean|force/], function (args) { return _this.killActiveWorker(args[0] === "clean"); });
            repl.registerCommand("set", [letters, "port", number, boolean], function (args) { return _this.setPort(args[0], Number(args[2]), args[3] === "true"); });
            repl.registerCommand("set", [/polling/, number, boolean], function (args) {
                var newPollingIntervalSeconds = Math.floor(Number(args[1]));
                if (newPollingIntervalSeconds < 0) {
                    _this.mainLog(colors_1.red("the polling interval must be a non-negative integer"));
                }
                else {
                    if (newPollingIntervalSeconds !== _this.config.polling.intervalSeconds) {
                        _this.config.polling.intervalSeconds = newPollingIntervalSeconds;
                        if (args[2] === "true") {
                            Monitor.IPCManager.emit("updatePollingInterval", { newPollingIntervalSeconds: newPollingIntervalSeconds });
                        }
                    }
                }
            });
            return repl;
        };
        _this.executeExitHandlers = function (reason) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, Promise.all(this.exitHandlers.map(function (handler) { return handler(reason); }))];
        }); }); };
        /**
         * Attempts to kill the active worker gracefully, unless otherwise specified.
         */
        _this.killActiveWorker = function (graceful, isSessionEnd) {
            if (graceful === void 0) { graceful = true; }
            if (isSessionEnd === void 0) { isSessionEnd = false; }
            if (_this.activeWorker && !_this.activeWorker.isDead()) {
                if (graceful) {
                    Monitor.IPCManager.emit("manualExit", { isSessionEnd: isSessionEnd });
                }
                else {
                    _this.activeWorker.process.kill();
                }
            }
        };
        /**
         * Allows the caller to set the port at which the target (be it the server,
         * the websocket, some other custom port) is listening. If an immediate restart
         * is specified, this monitor will kill the active child and re-launch the server
         * at the port. Otherwise, the updated port won't be used until / unless the child
         * dies on its own and triggers a restart.
         */
        _this.setPort = function (port, value, immediateRestart) {
            if (value > 1023 && value < 65536) {
                _this.config.ports[port] = value;
                if (immediateRestart) {
                    _this.killActiveWorker();
                }
            }
            else {
                _this.mainLog(colors_1.red(port + " is an invalid port number"));
            }
        };
        /**
         * Kills the current active worker and proceeds to spawn a new worker,
         * feeding in configuration information as environment variables.
         */
        _this.spawn = function () {
            var _a;
            var _b = _this.config, _c = _b.polling, route = _c.route, failureTolerance = _c.failureTolerance, intervalSeconds = _c.intervalSeconds, ports = _b.ports;
            _this.killActiveWorker();
            _this.activeWorker = cluster_1.fork({
                pollingRoute: route,
                pollingFailureTolerance: failureTolerance,
                serverPort: ports.server,
                socketPort: ports.socket,
                pollingIntervalSeconds: intervalSeconds,
                session_key: _this.key
            });
            Monitor.IPCManager = promisified_ipc_manager_1.manage(_this.activeWorker.process, _this.handlers);
            _this.mainLog(colors_1.cyan("spawned new server worker with process id " + ((_a = _this.activeWorker) === null || _a === void 0 ? void 0 : _a.process.pid)));
            _this.on("kill", function (_a) {
                var reason = _a.reason, graceful = _a.graceful, errorCode = _a.errorCode;
                return _this.killSession(reason, graceful, errorCode);
            }, true);
            _this.on("lifecycle", function (_a) {
                var event = _a.event;
                return console.log(_this.timestamp(), _this.config.identifiers.worker.text + " lifecycle phase (" + event + ")");
            }, true);
        };
        _this.config = _this.loadAndValidateConfiguration();
        _this.initialize(sessionKey);
        _this.repl = _this.initializeRepl();
        return _this;
    }
    Monitor.Create = function (sessionKey) {
        if (cluster_1.isWorker) {
            server_worker_1.ServerWorker.IPCManager.emit("kill", {
                reason: "cannot create a monitor on the worker process.",
                graceful: false,
                errorCode: 1
            });
            process.exit(1);
        }
        else if (++Monitor.count > 1) {
            console.error(colors_1.red("cannot create more than one monitor."));
            process.exit(1);
        }
        else {
            return new Monitor(sessionKey);
        }
    };
    Monitor.count = 0;
    return Monitor;
}(process_message_router_1.default));
exports.Monitor = Monitor;
(function (Monitor) {
    var IntrinsicEvents;
    (function (IntrinsicEvents) {
        IntrinsicEvents["KeyGenerated"] = "key_generated";
        IntrinsicEvents["CrashDetected"] = "crash_detected";
        IntrinsicEvents["ServerRunning"] = "server_running";
    })(IntrinsicEvents = Monitor.IntrinsicEvents || (Monitor.IntrinsicEvents = {}));
})(Monitor = exports.Monitor || (exports.Monitor = {}));
exports.Monitor = Monitor;
