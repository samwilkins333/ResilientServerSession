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
exports.__esModule = true;
var applied_session_agent_1 = require("../dist/agents/applied_session_agent");
var server_worker_1 = require("../dist/agents/server_worker");
var uuid_1 = require("uuid");
var TestSessionAgent = /** @class */ (function (_super) {
    __extends(TestSessionAgent, _super);
    function TestSessionAgent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TestSessionAgent.prototype.initializeMonitor = function (monitor) {
        return new Promise(function (resolve) {
            monitor.addReplCommand("hello", [], function () { return console.log("world!"); });
            resolve(uuid_1.v4());
        });
    };
    TestSessionAgent.prototype.initializeServerWorker = function () {
        return new Promise(function (resolve) {
            resolve(server_worker_1.ServerWorker.Create(function () { return console.log("SERVER WORKER CREATED!"); }));
        });
    };
    return TestSessionAgent;
}(applied_session_agent_1.AppliedSessionAgent));
// new TestSessionAgent().launch();
