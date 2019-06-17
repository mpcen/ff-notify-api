const axios = require('axios');
const { util_timeout } = require('../util/timeout');

const { RecentNewsService } = require('./RecentNews/RecentNewsService');
const { RecentPlayerNews } = require('./RecentPlayerNews/RecentPlayerNewsService');

const TIMEOUT = process.argv[2] || 3000;

console.log('Starting Services...');

(async () => {
    const recentNewsService = new RecentNewsService({ runTimes: 1, delay: 0 });
    let playersResponse;

    try {
        playersResponse = await axios.get('http://localhost:5000/players');
    } catch (e) {
        console.log('Error in main playersResponse:', e);
    }

    while (true) {
        console.log();

        let recentNews;

        try {
            recentNews = await recentNewsService.run();
            debugger;
            await RecentPlayerNews(recentNews, playersResponse.data[0].players);
        } catch (e) {
            console.log('Error main:', e);
        }

        recentNewsService.runTimes = 1;

        console.log('Timing out for', TIMEOUT + 'ms');
        await util_timeout(TIMEOUT);
    }
})();
