

const RecentNewsService = require('./services/RecentNews');
const PlayerService = require('./services/Player');
const RecentPlayerNewsService = require('./services/RecentPlayerNews');
const util_timeout = require('./util/timeout');
const Logger = require('./util/logger');

async function run(runTimes, delay, options) {
    while(runTimes) {
        const startTime = Logger.time();
        Logger.logHeader();
        
        const [ news, players ] = await Promise.all([
            new RecentNewsService().run(options.recentNewsServiceOptions),
            new PlayerService().run(options.playerServiceOptions)
        ]);

        RecentPlayerNewsService(players, news);

        if(typeof runTimes === 'number') runTimes--;

        Logger.logRuntime('Run took', startTime);
        Logger.logFooter();
        await util_timeout(delay);
    }
}

const options = {
    recentNewsServiceOptions: {
        runTimes: 1,
        delay: 0
    },
    playerServiceOptions: {
        runTimes: 1,
        delay: 0
    }
};



run(1, 0, options);

//const fs = require('fs');
//const { promisify } = require('util');
//const writeFileAsync = promisify(fs.writeFile);

//await writeFileAsync('./data/recentRelevantNewsCollection.json', JSON.stringify(recentRelevantNewsCollection));
// const recentRelevantNewsCollection = recentRelevantNewsCollectionJSON;
//const recentRelevantNewsCollection = require('./data/recentRelevantNewsCollection.json');