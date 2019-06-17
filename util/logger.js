"use strict";
exports.__esModule = true;
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.log = function (text) {
        console.log('*', text.toUpperCase());
        console.log();
    };
    Logger.logHeader = function () {
        console.log('=========================================');
        this.log('round started');
    };
    Logger.logFooter = function () {
        console.log();
        console.log('* ROUND FINISHED');
        console.log('=========================================');
        console.log();
        console.log();
    };
    Logger.time = function () {
        return Date.now();
    };
    Logger.logRuntime = function (text, startTime) {
        console.log(text + " " + (this.time() - startTime) + "ms");
    };
    return Logger;
}());
exports.Logger = Logger;
