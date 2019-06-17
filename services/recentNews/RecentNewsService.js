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
var date_fns_1 = require("date-fns");
var logger_1 = require("../../util/logger");
var dateTimeToUTC_1 = require("../../util/dateTimeToUTC");
var sources_1 = require("./sources");
var RecentNewsService = /** @class */ (function () {
    function RecentNewsService(_a) {
        var runTimes = _a.runTimes, delay = _a.delay;
        this.runTimes = runTimes;
        this.delay = delay;
        this.totalSourcesScanned = 0;
        this.totalTweetsScanned = 0;
    }
    RecentNewsService.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var recentNews, startTime, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        recentNews = [];
                        _a.label = 1;
                    case 1:
                        if (!this.runTimes) return [3 /*break*/, 6];
                        startTime = logger_1.Logger.time();
                        this.totalSourcesScanned = 0;
                        this.totalTweetsScanned = 0;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.fetchRecentNews(sources_1.TWITTER_SOURCES)];
                    case 3:
                        recentNews = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        console.log('Error in RecentNewsService run:', e_1);
                        return [2 /*return*/, []];
                    case 5:
                        logger_1.Logger.logRuntime('Recent News Scan completed in', startTime);
                        console.log('Total Recent News Sources:', this.totalSourcesScanned);
                        console.log('Total News Posts:', this.totalTweetsScanned);
                        if (typeof this.runTimes === 'number')
                            this.runTimes--;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, recentNews];
                }
            });
        });
    };
    RecentNewsService.prototype.fetchRecentNews = function (TWITTER_SOURCES) {
        return __awaiter(this, void 0, void 0, function () {
            var promises_1, e_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        promises_1 = [];
                        return [4 /*yield*/, TWITTER_SOURCES.forEach(function (TWITTER_SOURCE) {
                                promises_1.push(new Promise(function (resolve, reject) {
                                    return _this.fetchSource(TWITTER_SOURCE).then(function (response) { return resolve(response); });
                                }));
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Promise.all(promises_1).then(function (response) { return response; })];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        e_2 = _a.sent();
                        console.log('Error in RecentNewsService fetchRecentNews:', e_2);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RecentNewsService.prototype.fetchSource = function (TWITTER_SOURCE) {
        return __awaiter(this, void 0, void 0, function () {
            var BASE_URI, URL, $_1, _tweets, tweets_1, e_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        BASE_URI = 'https://twitter.com/';
                        URL = BASE_URI + "/" + TWITTER_SOURCE;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1["default"]
                                .get(URL)
                                .then(function (response) { return cheerio.load(response.data); })["catch"](function (err) { return err; })];
                    case 2:
                        $_1 = _a.sent();
                        _tweets = $_1('#timeline .stream .stream-items .stream-item .content');
                        tweets_1 = [];
                        this.totalSourcesScanned++;
                        _tweets.each(function (i, elem) {
                            _this.totalTweetsScanned++;
                            var id = $_1(elem)
                                .find('.stream-item-header .time .tweet-timestamp')
                                .attr('data-conversation-id');
                            var dateStr = $_1(elem)
                                .find('.stream-item-header .time .tweet-timestamp')
                                .attr('title');
                            var content = $_1(elem)
                                .find('.js-tweet-text-container .TweetTextSize')
                                .text();
                            if (dateStr && content) {
                                tweets_1.push({
                                    id: id,
                                    time: dateTimeToUTC_1.util_dateTimeToUTC(dateStr),
                                    content: content
                                });
                            }
                        });
                        // sorts tweet list into descending order (latest first);
                        tweets_1 = tweets_1.sort(function (a, b) {
                            if (date_fns_1.isBefore(new Date(a.time), new Date(b.time)))
                                return 1;
                            if (date_fns_1.isBefore(new Date(b.time), new Date(a.time)))
                                return -1;
                            return 0;
                        });
                        return [2 /*return*/, {
                                name: $_1('.ProfileHeaderCard-name')
                                    .children()
                                    .first()
                                    .text(),
                                username: $_1('.ProfileHeaderCard-screenname a span').text(),
                                verified: $_1('.ProfileHeaderCard-name').children().length > 1,
                                lastActivityTime: tweets_1[0].time,
                                tweets: tweets_1,
                                platform: 'twitter'
                            }];
                    case 3:
                        e_3 = _a.sent();
                        console.log('Error in RecentNewsService:', e_3);
                        return [2 /*return*/, e_3];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return RecentNewsService;
}());
exports.RecentNewsService = RecentNewsService;
