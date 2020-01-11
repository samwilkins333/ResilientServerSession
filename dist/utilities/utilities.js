"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var Utilities;
(function (Utilities) {
    function guid() {
        return uuid_1.v4();
    }
    Utilities.guid = guid;
    /**
         * At any arbitrary layer of nesting within the configuration objects, any single value that
         * is not specified by the configuration is given the default counterpart. If, within an object,
         * one peer is given by configuration and two are not, the one is preserved while the two are given
         * the default value.
         * @returns the composition of all of the assigned objects, much like Object.assign(), but with more
         * granularity in the overwriting of nested objects
         */
    function preciseAssign(target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
            var source = sources_1[_a];
            preciseAssignHelper(target, source);
        }
        return target;
    }
    Utilities.preciseAssign = preciseAssign;
    function preciseAssignHelper(target, source) {
        Array.from(new Set(__spreadArrays(Object.keys(target), Object.keys(source)))).map(function (property) {
            var targetValue, sourceValue;
            if (sourceValue = source[property]) {
                if (typeof sourceValue === "object" && typeof (targetValue = target[property]) === "object") {
                    preciseAssignHelper(targetValue, sourceValue);
                }
                else {
                    target[property] = sourceValue;
                }
            }
        });
    }
    Utilities.preciseAssignHelper = preciseAssignHelper;
})(Utilities = exports.Utilities || (exports.Utilities = {}));
