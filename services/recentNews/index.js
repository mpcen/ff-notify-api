const cheerio = require('cheerio');
const request = require('request-promise');
const axios = require('axios');

const Logger = require('../../util/logger');
const util_timeout = require('../../util/timeout');
const RECENT_NEWS_SOURCES = require('./sources');

class RecentNewsService {
    constructor() {
        this.totalSourcesScanned = 0;
        this.totalTweetsScanned = 0;
    }

    async run({runTimes, delay }) {
        let recentNews;

        while(runTimes) {
            let startTime = Logger.time();

            this.totalSourcesScanned = 0;
            this.totalTweetsScanned = 0;

            recentNews = await this.fetchRecentNews(RECENT_NEWS_SOURCES);

            Logger.logRuntime('Recent News Scan completed in', startTime);
            console.log('Total Recent News Sources:', this.totalSourcesScanned);
            console.log('Total News Posts:', this.totalTweetsScanned);
            console.log();
            
            if(typeof runTimes === 'number') runTimes--;

            await util_timeout(delay);
        }

        //console.log('response:', response);

        //await axios.get('http://localhost:5000/recentNews');

        await axios.post('http://localhost:5000/recentNews', {
            name: 'twitter',
            recentNews
        });

        return recentNews;
    }

    async fetchRecentNews(RECENT_NEWS_SOURCES) {
        const promises = [];

        await RECENT_NEWS_SOURCES.forEach(RECENT_NEWS_SOURCE => {
            promises.push(
                new Promise((resolve, reject) => this.fetchSource(RECENT_NEWS_SOURCE)
                    .then(response => resolve(response)))
                    .catch(err => reject(err))
            );
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
    
            const time = $(elem).find('.stream-item-header .time .tweet-timestamp').attr('title');
            const content = $(elem).find('.js-tweet-text-container .TweetTextSize').text();

            if(time && content) tweets.push({ time, content });
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