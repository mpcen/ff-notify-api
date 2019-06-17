"use strict";
exports.__esModule = true;
var date_fns_1 = require("date-fns");
function util_dateTimeToUTC(dateStr) {
    var _a = dateStr.split(' - ').map(function (val) { return val; }), time = _a[0], date = _a[1];
    var _b = date.split(' ').map(function (val) { return val; }), day = _b[0], month = _b[1], year = _b[2];
    return date_fns_1.parse(month + " " + day + " " + year + " " + time).toUTCString();
}
exports.util_dateTimeToUTC = util_dateTimeToUTC;
