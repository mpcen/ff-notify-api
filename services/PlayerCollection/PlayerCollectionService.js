"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var cheerio = require("cheerio");
var axios_1 = require("axios");
var teams_1 = require("./teams");
var timeout_1 = require("../../util/timeout");
var suffixes_1 = require("../../util/suffixes");
var PlayerCollectionService = /** @class */ (function () {
    function PlayerCollectionService(_a) {
        var runTimes = _a.runTimes, delay = _a.delay;
        this.runTimes = runTimes;
        this.delay = delay;
        this.totalTeamsScanned = 0;
        this.totalPlayersScanned = 0;
    }
    PlayerCollectionService.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var teamsWithPlayers, players, startTime, e_1, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        teamsWithPlayers = [];
                        players = [];
                        _a.label = 1;
                    case 1:
                        if (!this.runTimes) return [3 /*break*/, 11];
                        startTime = Date.now();
                        this.totalTeamsScanned = 0;
                        this.totalPlayersScanned = 0;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.fetchTeamsWithPlayers(teams_1.teams)];
                    case 3:
                        teamsWithPlayers = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        console.log('Error from within PlayerCollectionService run:', e_1);
                        return [2 /*return*/, []];
                    case 5:
                        console.log('Player Collection Scan completed in', Date.now() - startTime + 'ms');
                        console.log('Total Teams Scanned:', this.totalTeamsScanned);
                        console.log('Total Players discovered:', this.totalPlayersScanned);
                        console.log();
                        if (typeof this.runTimes === 'number')
                            this.runTimes--;
                        players = this.flattenPlayers(teamsWithPlayers);
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, axios_1["default"].post('http://localhost:5000/players', players)];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        e_2 = _a.sent();
                        console.log('Error in PlayerServices run:', e_2);
                        return [2 /*return*/, []];
                    case 9: return [4 /*yield*/, timeout_1.util_timeout(this.delay)];
                    case 10:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 11: return [2 /*return*/, players];
                }
            });
        });
    };
    PlayerCollectionService.prototype.fetchTeamsWithPlayers = function (TEAMS_NFL_COM) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, e_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        return [4 /*yield*/, TEAMS_NFL_COM.forEach(function (team) {
                                promises.push(new Promise(function (resolve) {
                                    return _this.fetchNFLPlayers(team).then(function (response) {
                                        _this.totalTeamsScanned++;
                                        return resolve(response);
                                    });
                                }));
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, Promise.all(promises)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        e_3 = _a.sent();
                        console.log('Error in fetchTeamsWithPlayers:', e_3);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    PlayerCollectionService.prototype.fetchNFLPlayers = function (team) {
        return __awaiter(this, void 0, void 0, function () {
            var response, e_4, $, $players, players;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1["default"].get(team.url)];
                    case 1:
                        response = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_4 = _a.sent();
                        console.log('Error in fetchNFLPlayer:', e_4);
                        return [2 /*return*/, []];
                    case 3:
                        $ = cheerio.load(response.data);
                        console.log('Gathering', team.name, 'players');
                        $players = $('tbody.Table2__tbody tr');
                        players = [];
                        $players.each(function (i, elem) {
                            var $player = $(elem).find('td.Table2__td');
                            var playerName = $player
                                .find('span')
                                .children()
                                .eq(1)
                                .text();
                            var name_split = playerName.split(' ');
                            var maybeSuffix = name_split[name_split.length - 1];
                            if (!suffixes_1.SUFFIXES.has(maybeSuffix)) {
                                maybeSuffix = '';
                            }
                            else {
                                name_split.pop();
                                playerName = name_split.join(' ');
                            }
                            var player = {
                                name: playerName,
                                suffix: maybeSuffix,
                                college: $player
                                    .children()
                                    .eq(7)
                                    .text(),
                                teamId: team.id,
                                position: $player
                                    .children()
                                    .eq(2)
                                    .text(),
                                number: $(elem)
                                    .find('span span')
                                    .text()
                            };
                            _this.totalPlayersScanned++;
                            players.push(player);
                        });
                        return [2 /*return*/, players];
                }
            });
        });
    };
    PlayerCollectionService.prototype.flattenPlayers = function (teams) {
        var playerMap = new Map();
        var flattenedPlayers = [];
        teams.forEach(function (players) {
            players.forEach(function (player) {
                if (!playerMap.has(player.name)) {
                    playerMap.set(player.name, [player]);
                }
                else {
                    playerMap.get(player.name).push(player);
                }
            });
        });
        playerMap.forEach(function (players) {
            players.forEach(function (player) { return flattenedPlayers.push(player); });
        });
        return flattenedPlayers;
    };
    return PlayerCollectionService;
}());
exports.PlayerCollectionService = PlayerCollectionService;
