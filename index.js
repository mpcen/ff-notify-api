const fs = require('fs');
const { promisify } = require('util');

const writeFileAsync = promisify(fs.writeFile);
const recentNewsService = require('./recentNews');
const playerCollectionService = require('./teams');
const playerNewsService = require('./player-news-matcher');
const timeout = require('./util/timeout');
const logger = require('./util/logger');


async function run(runTimes, delay) {
    while(runTimes) {
        console.log('=======================================================================================')
        logger('round started');
        const roundStartTime = Date.now();
        
        // const [
        //     recentNewsCollection,
        //     rosteredPlayerCollection
        // ] = await Promise.all([
        //     recentNewsService(1, 0),
        //     playerCollectionService(1, 0)
        // ]);
        // const recentRelevantNewsCollection = playerNewsService(
        //     rosteredPlayerCollection,
        //     recentNewsCollection
        // );

        //await writeFileAsync('./data/recentRelevantNewsCollection.json', JSON.stringify(recentRelevantNewsCollection));

        // const recentRelevantNewsCollection = recentRelevantNewsCollectionJSON;

        const recentRelevantNewsCollection = require('./data/recentRelevantNewsCollection.json');
        
        console.log(recentRelevantNewsCollection);





        if(typeof runTimes === 'number') runTimes--;
        console.log('Run took', Date.now() - roundStartTime + 'ms');
        console.log();
        console.log('* ROUND FINISHED');
        console.log('=======================================================================================')
        console.log();console.log();
        await timeout(delay);
    }
}

run(1, 0);