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
var readline_1 = require("readline");
var colors_1 = require("colors");
var Repl = /** @class */ (function () {
    function Repl(_a) {
        var _this = this;
        var prompt = _a.identifier, onInvalid = _a.onInvalid, onValid = _a.onValid, isCaseSensitive = _a.isCaseSensitive;
        this.commandMap = new Map();
        this.busy = false;
        this.resolvedIdentifier = function () { return typeof _this.identifier === "string" ? _this.identifier : _this.identifier(); };
        this.usage = function (command, validCommand) {
            if (validCommand) {
                var formatted_1 = colors_1.white(command);
                var patterns = colors_1.green(_this.commandMap.get(command).map(function (_a) {
                    var argPatterns = _a.argPatterns;
                    return formatted_1 + "  " + argPatterns.join("  ");
                }).join('\n'));
                return _this.resolvedIdentifier() + "\nthe given arguments do not match any registered patterns for " + formatted_1 + "\nthe list of valid argument patterns is given by:\n" + patterns;
            }
            else {
                var resolved = _this.keys;
                if (resolved) {
                    return resolved;
                }
                var members = [];
                var keys = _this.commandMap.keys();
                var next = void 0;
                while (!(next = keys.next()).done) {
                    members.push(next.value);
                }
                return _this.resolvedIdentifier() + " commands: { " + members.sort().join(", ") + " }";
            }
        };
        this.success = function (command) { return _this.resolvedIdentifier() + " completed local execution of " + colors_1.white(command); };
        this.registerCommand = function (basename, argPatterns, action) {
            var existing = _this.commandMap.get(basename);
            var converted = argPatterns.map(function (input) { return input instanceof RegExp ? input : new RegExp(input); });
            var registration = { argPatterns: converted, action: action };
            if (existing) {
                existing.push(registration);
            }
            else {
                _this.commandMap.set(basename, [registration]);
            }
        };
        this.invalid = function (command, validCommand) {
            console.log(colors_1.red(typeof _this.onInvalid === "string" ? _this.onInvalid : _this.onInvalid(command, validCommand)));
            _this.busy = false;
        };
        this.valid = function (command) {
            console.log(colors_1.green(typeof _this.onValid === "string" ? _this.onValid : _this.onValid(command)));
            _this.busy = false;
        };
        this.considerInput = function (line) { return __awaiter(_this, void 0, void 0, function () {
            var _a, command, args, registered, length_1, candidates, _loop_1, _i, candidates_1, _b, argPatterns, action, state_1;
            var _this = this;
            return __generator(this, function (_c) {
                if (this.busy) {
                    console.log(colors_1.red("Busy"));
                    return [2 /*return*/];
                }
                this.busy = true;
                line = line.trim();
                if (this.isCaseSensitive) {
                    line = line.toLowerCase();
                }
                _a = line.split(/\s+/g), command = _a[0], args = _a.slice(1);
                if (!command) {
                    return [2 /*return*/, this.invalid(command, false)];
                }
                registered = this.commandMap.get(command);
                if (registered) {
                    length_1 = args.length;
                    candidates = registered.filter(function (_a) {
                        var count = _a.argPatterns.length;
                        return count === length_1;
                    });
                    _loop_1 = function (argPatterns, action) {
                        var parsed = [];
                        var matched = true;
                        if (length_1) {
                            for (var i = 0; i < length_1; i++) {
                                var matches = void 0;
                                if ((matches = argPatterns[i].exec(args[i])) === null) {
                                    matched = false;
                                    break;
                                }
                                parsed.push(matches[0]);
                            }
                        }
                        if (!length_1 || matched) {
                            var result = action(parsed);
                            var resolve = function () { return _this.valid(command + " " + parsed.join(" ")); };
                            if (result instanceof Promise) {
                                result.then(resolve);
                            }
                            else {
                                resolve();
                            }
                            return { value: void 0 };
                        }
                    };
                    for (_i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
                        _b = candidates_1[_i], argPatterns = _b.argPatterns, action = _b.action;
                        state_1 = _loop_1(argPatterns, action);
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                    }
                    this.invalid(command, true);
                }
                else {
                    this.invalid(command, false);
                }
                return [2 /*return*/];
            });
        }); };
        this.identifier = prompt;
        this.onInvalid = onInvalid || this.usage;
        this.onValid = onValid || this.success;
        this.isCaseSensitive = (isCaseSensitive !== null && isCaseSensitive !== void 0 ? isCaseSensitive : true);
        this.interface = readline_1.createInterface(process.stdin, process.stdout).on('line', this.considerInput);
    }
    return Repl;
}());
exports.default = Repl;
