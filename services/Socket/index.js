"use strict";
exports.__esModule = true;
var express = require("express");
var http_1 = require("http");
var SocketIO = require("socket.io"); // Need to figure this warning out
var events_1 = require("events");
var app = express();
var server = new http_1.Server(app);
var io = SocketIO(server);
var PORT = process.env.PORT || 5001;
exports.emitter = new events_1.EventEmitter();
exports.emitter.on('alert', function (newRecentPlayerNews) {
    io.emit('alert', newRecentPlayerNews);
});
io.on('connection', function (socket) {
    console.log('Connected to Socket');
    socket.on('alert', function (newRecentPlayerNews) {
        console.log('New News from Socket Server:', newRecentPlayerNews);
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});
server.listen(PORT, function () {
    console.log('Socket running on port:', PORT);
});
