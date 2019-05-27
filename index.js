//const twitterService = require('./twitter');
const teamsService = require('./teams');
const buildPlayerMap = require('./players');


async function run(runTimes, delay) {
    const teams = await teamsService(runTimes, delay);
    const playerMap = buildPlayerMap(teams);

    
}

run(1, 0);