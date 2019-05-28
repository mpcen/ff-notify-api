const twitterService = require('./twitter');
const teamsService = require('./teams');
const buildPlayerMap = require('./players');
const playerNewsService = require('./player-news-matcher');
const timeout = require('./util/timeout');


async function run(runTimes, delay) {
    while(runTimes) {
        const startTime = Date.now();
        console.log('===========================');
        console.log('ROUND STARTED')
        console.log('===========================');
    
        console.log('===========================');
        console.log('TWEET SERVICE RUNNING')
        console.log('===========================');
    
        const tweetData = await twitterService(1, 0);

        console.log('===========================');
        console.log('TWEET SERVICE FINISHED')
        console.log('===========================');
    
        console.log('===========================');
        console.log('PLAYER SERVICE RUNNING')
        console.log('===========================');
    
        const teams = await teamsService(1, 0);
        const playerMap = buildPlayerMap(teams);
        const playerNewsData = playerNewsService(playerMap, tweetData);

        if(typeof runTimes === 'number') {
            runTimes--;
        }

        console.log('===========================');
        console.log('PLAYER SERVICE FINISHED')
        console.log('===========================');
    
        console.log('************************************************');
        console.log('ROUND FINISHED');
        console.log('Run took', Date.now() - startTime + 'ms');
        console.log('************************************************');

        await timeout(delay);
    }
}

run(1, 0);