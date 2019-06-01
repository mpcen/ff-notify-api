//const fs = require('fs');
//const { promisify } = require('util');
//const writeFileAsync = promisify(fs.writeFile);

const RecentNewsService = require('./services/RecentNews');
const PlayerService = require('./services/Player');
const RecentPlayerNewsService = require('./services/RecentPlayerNews');
const timeout = require('./util/timeout');
const logger = require('./util/logger');


async function run({ runTimes, delay }) {
    while(runTimes) {
        console.log('=======================================================================================')
        logger('round started');
        const roundStartTime = Date.now();
        
        const [ news, players ] = await Promise.all([
            new RecentNewsService().run(runTimes, delay),
            new PlayerService().run(runTimes, delay)
        ]);

        const recentRelevantNewsCollection = RecentPlayerNewsService(players, news);

        //await writeFileAsync('./data/recentRelevantNewsCollection.json', JSON.stringify(recentRelevantNewsCollection));
        // const recentRelevantNewsCollection = recentRelevantNewsCollectionJSON;
        //const recentRelevantNewsCollection = require('./data/recentRelevantNewsCollection.json');
        



        if(typeof runTimes === 'number') runTimes--;
        console.log('Run took', Date.now() - roundStartTime + 'ms');
        console.log();
        console.log('* ROUND FINISHED');
        console.log('=======================================================================================')
        console.log();console.log();
        await timeout(delay);
    }
}

const options = {
    runTimes: 1,
    delay: 0
};

run(options);