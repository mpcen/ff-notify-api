const cheerio = require('cheerio');
const request = require('request-promise');
const axios = require('axios');

const timeout = require('../../util/timeout');
const SOURCES = require('./sources');
const logger = require('../../util/logger');

let totalSourcesScanned = 0;
let totalTweetsScanned = 0;

async function fetchSource(username) {
    const BASE_URI = 'https://twitter.com/';
    const URL = `${BASE_URI}/${username}`;
    const $ = await request(URL).then(response => cheerio.load(response)).catch(err => err);
    const _tweets = $('#timeline .stream .stream-items .stream-item .content');
    const tweets = [];

    totalSourcesScanned++;

    _tweets.each((i, elem) => {
        totalTweetsScanned++;

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

async function fetchSources(sources) {
    const promises = [];
    await sources.forEach(source => {
        promises.push(new Promise(resolve => fetchSource(source).then(response => resolve(response)) ))
    });

    return await Promise.all(promises).then(response => response);
}

async function run(runTimes, delay) {
    let response;
    let lastAmountScanned = 0;

    while(runTimes) {
        //logger('recent news service running');

        let startTime = Date.now();

        // if(totalTweetsScanned > lastAmountScanned) {
        //     lastAmountScanned = totalTweetsScanned;
        //     console.log('posting:', response[0]);
        //     await axios.post('http://localhost:3001', response[0]);
        // }

        totalSourcesScanned = 0;
        totalTweetsScanned = 0;

        response = await fetchSources(SOURCES);

        console.log('Recent News Scan completed in', Date.now() - startTime + 'ms');
        console.log('Total Recent News Sources:', totalSourcesScanned);
        console.log('Total News Posts:', totalTweetsScanned);
        console.log();
        
        if(typeof runTimes === 'number') runTimes--;

        await timeout(delay);
    }

    return response;
}

module.exports = run;