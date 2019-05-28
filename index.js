const twitterService = require('./twitter');
const teamsService = require('./teams');
const buildPlayerMap = require('./players');


async function run(runTimes, delay) {
    console.log('===========================');
    console.log('TWEET SERVICE')
    console.log('===========================');

    const tweetData = await twitterService(runTimes, delay);

    console.log('===========================');
    console.log('PLAYER SERVICE')
    console.log('===========================');

    const teams = await teamsService(runTimes, delay);
    const playerMap = buildPlayerMap(teams);

    console.log('************************************************');
    console.log('END OF SERVICE ITERATION');
    console.log('************************************************');
}

run(1, 0);