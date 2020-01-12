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
exports.__esModule = true;
var chai_1 = require("chai");
var child_process_1 = require("child_process");
var promisified_ipc_manager_1 = require("../dist/agents/promisified_ipc_manager");
var mocha_1 = require("mocha");
var uuid_1 = require("uuid");
var secret = uuid_1.v4();
var delayFactor = 0.25;
var milliseconds = 10000;
function onRequestSecret() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(function () { return resolve(secret); }, milliseconds * delayFactor); })];
        });
    });
}
var localHandlers = { requestSecret: [onRequestSecret] };
var child = child_process_1.fork(__dirname + "/child.js");
var manager = promisified_ipc_manager_1.manage(child, localHandlers);
mocha_1.describe("emitPromise functionality test", function () {
    it("should take the appropriate duration to return the promised message", function () {
        return __awaiter(this, void 0, void 0, function () {
            var before, parentPid, childPid, _a, response, error, elapsed;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.timeout(0);
                        before = Date.now();
                        parentPid = process.pid;
                        childPid = child.pid;
                        return [4 /*yield*/, manager.emit("wait", { milliseconds: milliseconds, parentPid: parentPid })];
                    case 1:
                        _a = _b.sent(), response = _a.results[0], error = _a.error;
                        elapsed = Date.now() - before;
                        chai_1.expect(elapsed, "The promise resolved too early.").to.be.greaterThan((1 + delayFactor) * milliseconds);
                        chai_1.expect(response, "The response from the child was malformed.").to.be.equal("Hey, " + parentPid + "! What a long wait that was. I'm " + childPid + ". Your secret is " + secret);
                        chai_1.expect(error, "An unexpected error occurred.").to.be.equal(undefined);
                        return [2 /*return*/];
                }
            });
        });
    });
    it("should resolve the promise early with the appropriate error message", function () {
        return __awaiter(this, void 0, void 0, function () {
            var destructionInterval, before, _a, results, _b, name, message, elapsed;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.timeout(0);
                        destructionInterval = milliseconds / 2;
                        before = Date.now();
                        setTimeout(manager.destroy, destructionInterval);
                        return [4 /*yield*/, manager.emit("wait", { milliseconds: milliseconds, parentPid: process.pid })];
                    case 1:
                        _a = _c.sent(), results = _a.results, _b = _a.error, name = _b.name, message = _b.message;
                        elapsed = Date.now() - before;
                        chai_1.expect(elapsed, "The promise resolved too late.").to.be.lessThan(destructionInterval + 50);
                        chai_1.expect(message, "The expected error did not occur or had wrong message.").to.be.equal("The IPC manager was destroyed before the response could be returned.");
                        chai_1.expect(name, "The expected error did not occur or had wrong name.").to.be.equal("ManagerDestroyed");
                        chai_1.expect(results, "There was an unexpected presence of results.").to.be.equal(undefined);
                        return [2 /*return*/];
                }
            });
        });
    });
});
