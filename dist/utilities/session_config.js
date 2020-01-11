"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var colors_1 = require("colors");
var colorPattern = /black|red|green|yellow|blue|magenta|cyan|white|gray|grey/;
var identifierProperties = {
    type: "object",
    properties: {
        text: {
            type: "string",
            minLength: 1
        },
        color: {
            type: "string",
            pattern: colorPattern
        }
    }
};
var portProperties = {
    type: "number",
    minimum: 1024,
    maximum: 65535
};
exports.configurationSchema = {
    id: "/configuration",
    type: "object",
    properties: {
        showServerOutput: { type: "boolean" },
        ports: {
            type: "object",
            properties: {
                server: portProperties,
                socket: portProperties
            },
            required: ["server"],
            additionalProperties: true
        },
        identifiers: {
            type: "object",
            properties: {
                master: identifierProperties,
                worker: identifierProperties,
                exec: identifierProperties
            }
        },
        polling: {
            type: "object",
            additionalProperties: false,
            properties: {
                intervalSeconds: {
                    type: "number",
                    minimum: 1,
                    maximum: 86400
                },
                route: {
                    type: "string",
                    pattern: /\/[a-zA-Z]*/g
                },
                failureTolerance: {
                    type: "number",
                    minimum: 0,
                }
            }
        },
    }
};
exports.colorMapping = new Map([
    ["yellow", colors_1.yellow],
    ["red", colors_1.red],
    ["cyan", colors_1.cyan],
    ["green", colors_1.green],
    ["blue", colors_1.blue],
    ["magenta", colors_1.magenta],
    ["grey", colors_1.grey],
    ["gray", colors_1.gray],
    ["white", colors_1.white],
    ["black", colors_1.black]
]);
exports.defaultConfig = {
    showServerOutput: false,
    identifiers: {
        master: {
            text: "__monitor__",
            color: "yellow"
        },
        worker: {
            text: "__server__",
            color: "magenta"
        },
        exec: {
            text: "__exec__",
            color: "green"
        }
    },
    ports: { server: 3000 },
    polling: {
        route: "/",
        intervalSeconds: 30,
        failureTolerance: 0
    }
};
