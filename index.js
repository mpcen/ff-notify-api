const twitterService = require('./twitter');
const teamsService = require('./teams');
const buildPlayerMap = require('./players');
const playerNewsService = require('./player-news-matcher');
const timeout = require('./util/timeout');
const logger = require('./util/logger');


async function run(runTimes, delay) {
    while(runTimes) {
        const startTime = Date.now();
        
        logger('round started');
        logger('tweet service running');
    
        const tweetData = await twitterService(1, 0);

        logger('tweet service finished');
        logger('player service running');
    
        const teams = await teamsService(1, 0);
        const playerMap = buildPlayerMap(teams);
        const playerNewsData = playerNewsService(playerMap, tweetData);

        if(typeof runTimes === 'number') {
            runTimes--;
        }

        logger('player service finished');
        logger('round finished');
    
        console.log('Run took', Date.now() - startTime + 'ms');
        await timeout(delay);
    }
}

run(1, 0);