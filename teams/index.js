const cheerio = require('cheerio');
const request = require('request-promise');

const teamsDB = require('./teams.json');
const timeout = require('../util/timeout');

let totalTeamsScanned = 0;
let totalTeamErrorsDetected = 0;
let totalPlayersScanned = 0;

async function fetchTeams(teamsDB) {
    const promises = [];

    teamsDB.teams.forEach(team => {
        promises.push(
            new Promise((resolve, reject) => {
                return fetchTeam(team)
                    .then(response => {
                        totalTeamsScanned++;
                        resolve(response)
                    })
                    .catch(err => {
                        totalTeamErrorsDetected++;
                        reject(err)
                    });
            })
        );
    });
    
    return await Promise.all(promises).then(response => response);
}

async function fetchTeam(team) {
    const ROUTE = 'team/players-roster/';
    const URL = `https://${team.url}/${ROUTE}`;
    const $ = await request(URL).then(response => cheerio.load(response)).catch(err => err);
    const $players =  $('table tbody tr').find('.sorter-lastname');
    const players = [];

    $players.each((i, elem) => {
        const player = {
            name: $(elem).find('div span a').text(),
            college: $(elem).next().next().next().next().next().next().next().text(),
            teamId: team.id,
            position: $(elem).next().next().text(),
            number: $(elem).next().text(),
        };

        totalPlayersScanned++;
        players.push(player);
    });
    
    return players;
}

async function run(runTimes, delay) {
    let response;

    while(runTimes) {
        let startTime = Date.now();
        totalTeamsScanned = 0;
        totalPlayersScanned = 0;
        totalTeamErrorsDetected = 0;

        response = await fetchTeams(teamsDB);
        
        //console.log('response:', JSON.stringify(response, undefined, 2));
        console.log('Scan completed in', Date.now() - startTime + 'ms');
        console.log('Total Teams Scanned:', totalTeamsScanned);
        console.log('Total Players Scanned:', totalPlayersScanned);
        console.log('Total Team Errors Detected:', totalTeamErrorsDetected);
        
        runTimes--;

        await timeout(delay);        
    }

    return response;
}

module.exports = run;