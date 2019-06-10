const cheerio = require('cheerio');
const request = require('request-promise');
const axios = require('axios');
const isBefore = require('date-fns/is_before');

const Logger = require('../../util/logger');
const util_timeout = require('../../util/timeout');
const util_dateTimeToUTC = require('../../util/dateTimeToUTC');
const RECENT_NEWS_SOURCES = require('./sources');

class RecentNewsService {
    constructor({ runTimes, delay }) {
        this.runTimes = runTimes;
        this.delay = delay;
        this.totalSourcesScanned = 0;
        this.totalTweetsScanned = 0;
    }

    async run() {
        let recentNews;

        while(this.runTimes) {
            let startTime = Logger.time();

            this.totalSourcesScanned = 0;
            this.totalTweetsScanned = 0;

            try {
                recentNews = await this.fetchRecentNews(RECENT_NEWS_SOURCES);
            } catch(e) {
                console.log('Error in RecentNewsService run:', e);
                return [];
            }

            Logger.logRuntime('Recent News Scan completed in', startTime);
            console.log('Total Recent News Sources:', this.totalSourcesScanned);
            console.log('Total News Posts:', this.totalTweetsScanned);
            
            if(typeof this.runTimes === 'number') this.runTimes--;

            return recentNews;
            
            // try {
            //     await axios.post('http://localhost:5000/recentNews', {
            //         name: 'twitter',
            //         recentNews
            //     });
                
            //     await util_timeout(this.delay);
            // } catch(e) {
            //     console.log('Error in RecentNewsService run:', e);
            //     return [];
            // }
        }

        return recentNews;
    }

    async fetchRecentNews(RECENT_NEWS_SOURCES) {
        try {
            const promises = [];
            await RECENT_NEWS_SOURCES.forEach(RECENT_NEWS_SOURCE => {
                promises.push(
                    new Promise((resolve, reject) => this.fetchSource(RECENT_NEWS_SOURCE)
                        .then(response => resolve(response)))
                        .catch(err => reject(err))
                );
            });
            return await Promise.all(promises).then(response => response);
        } catch(e) {
            console.log('Error in RecentNewsService fetchRecentNews:', e);
            return [];
        }
    }

    async fetchSource(RECENT_NEWS_SOURCE) {
        const BASE_URI = 'https://twitter.com/';
        const URL = `${BASE_URI}/${RECENT_NEWS_SOURCE}`;

        try {
            const $ = await request(URL).then(response => cheerio.load(response)).catch(err => err);
            const _tweets = $('#timeline .stream .stream-items .stream-item .content');
            let tweets = [];
        
            this.totalSourcesScanned++;
        
            _tweets.each((i, elem) => {
                this.totalTweetsScanned++;

                const id = $(elem).find('.stream-item-header .time .tweet-timestamp').attr('data-conversation-id');
                const dateStr = $(elem).find('.stream-item-header .time .tweet-timestamp').attr('title');
                const content = $(elem).find('.js-tweet-text-container .TweetTextSize').text();

                if(dateStr && content) {
                    tweets.push({
                        id,
                        time: util_dateTimeToUTC(dateStr),
                        content
                    });
                }
            });

            // sorts tweet list into descending order (latest first);
            tweets = tweets.sort((a, b) => {
                if(isBefore(new Date(a.time), new Date(b.time))) return 1;
                if(isBefore(new Date(b.time), new Date(a.time))) return -1;
                return 0;
            });
        
            return {
                name: $('.ProfileHeaderCard-name').children().first().text(),
                username: $('.ProfileHeaderCard-screenname a span').text(),
                verified: $('.ProfileHeaderCard-name').children().length > 1,
                lastActivityTime: tweets[0].time,
                tweets,
                platform: 'twitter'
            };
        } catch(e) {
            console.log('Error in RecentNewsService:', e);
            return e;
        }
    }
}

module.exports = RecentNewsService;