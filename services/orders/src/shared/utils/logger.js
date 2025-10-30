"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var Logger = /** @class */ (function () {
    function Logger(context) {
        this.context = context;
    }
    Logger.prototype.log = function (level, message, data) {
        var timestamp = new Date().toISOString();
        var logEntry = __assign({ timestamp: timestamp, level: level, context: this.context, message: message }, (data && { data: data }));
        console.log(JSON.stringify(logEntry));
    };
    Logger.prototype.debug = function (message, data) {
        this.log(LogLevel.DEBUG, message, data);
    };
    Logger.prototype.info = function (message, data) {
        this.log(LogLevel.INFO, message, data);
    };
    Logger.prototype.warn = function (message, data) {
        this.log(LogLevel.WARN, message, data);
    };
    Logger.prototype.error = function (message, error) {
        var errorData = error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
            }
            : error;
        this.log(LogLevel.ERROR, message, errorData);
    };
    return Logger;
}());
exports.Logger = Logger;
//helper for create logger instance
var createLogger = function (context) {
    return new Logger(context);
};
exports.createLogger = createLogger;
