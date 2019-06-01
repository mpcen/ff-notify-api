const cheerio = require('cheerio');
const request = require('request-promise');
//const axios = require('axios');

const util_timeout = require('../../util/timeout');
const RECENT_NEWS_SOURCES = require('./sources');

class RecentNewsService {
    constructor() {
        this.totalSourcesScanned = 0;
        this.totalTweetsScanned = 0;
    }

    async run({runTimes, delay }) {
        let response;

        while(runTimes) {
            let startTime = Date.now();

            this.totalSourcesScanned = 0;
            this.totalTweetsScanned = 0;

            response = await this.fetchSources(RECENT_NEWS_SOURCES);

            console.log('Recent News Scan completed in', Date.now() - startTime + 'ms');
            console.log('Total Recent News Sources:', this.totalSourcesScanned);
            console.log('Total News Posts:', this.totalTweetsScanned);
            console.log();
            
            if(typeof runTimes === 'number') runTimes--;

            await util_timeout(delay);
        }

        return response;
    }

    async fetchSources(RECENT_NEWS_SOURCES) {
        const promises = [];

        await RECENT_NEWS_SOURCES.forEach(RECENT_NEWS_SOURCE => {
            promises.push(new Promise(resolve => this.fetchSource(RECENT_NEWS_SOURCE).then(response => resolve(response))));
        });

        return await Promise.all(promises).then(response => response);
    }

    async fetchSource(RECENT_NEWS_SOURCE) {
        const BASE_URI = 'https://twitter.com/';
        const URL = `${BASE_URI}/${RECENT_NEWS_SOURCE}`;
        const $ = await request(URL).then(response => cheerio.load(response)).catch(err => err);
        const _tweets = $('#timeline .stream .stream-items .stream-item .content');
        const tweets = [];
    
        this.totalSourcesScanned++;
    
        _tweets.each((i, elem) => {
            this.totalTweetsScanned++;
    
            tweets.push({
                time: $(elem).find('.stream-item-header .time .tweet-timestamp').text(),
                content: $(elem).find('.js-tweet-text-container .TweetTextSize').text()
            });
        });
    
        return {
            name: $('.ProfileHeaderCard-name').children().first().text(),
            username: $('.ProfileHeaderCard-screenname a span').text(),
            verified: $('.ProfileHeaderCard-name').children().length > 1,
            tweets
        };
    }
}

module.exports = RecentNewsService;