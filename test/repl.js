"use strict";
exports.__esModule = true;
var repl_1 = require("../dist/utilities/repl");
var repl = new repl_1["default"]({ identifier: function () { return "Sam"; } });
repl.registerCommand("exit", [], function () { return process.exit(0); });
