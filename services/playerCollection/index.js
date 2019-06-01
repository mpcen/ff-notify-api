const cheerio = require('cheerio');
const request = require('request-promise');

const teamsDB = require('./teams.json');
const timeout = require('../../util/timeout');
const suffixSet = require('../../util/suffixes');
const logger = require('../../util/logger');

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
        let playerName = $(elem).find('div span a').text();
        let name_split = playerName.split(' ');
        let maybeSuffix = name_split[name_split.length - 1];

        if(!suffixSet.has(maybeSuffix)) {
            maybeSuffix = '';
        } else {
            name_split.pop();
            playerName = name_split.join(' ');
        }

        const player = {
            name: playerName,
            suffix: maybeSuffix,
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

function buildPlayerMap(teams) {
    const playerMap = new Map();

    teams.forEach(players => {
        players.forEach(player => {
            if(!playerMap.has(player.name)) {
                playerMap.set(player.name, [player]);
            } else {
                playerMap.get(player.name).push(player);
            }
        });
    });
    
    return playerMap;
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
        console.log('Player Collection Scan completed in', Date.now() - startTime + 'ms');
        console.log('Total Teams Scanned:', totalTeamsScanned);
        console.log('Total Players Scanned:', totalPlayersScanned);
        console.log('Total Team Errors Detected:', totalTeamErrorsDetected);
        console.log();
        
        runTimes--;

        await timeout(delay);        
    }
    
    
    return buildPlayerMap(response);
}

module.exports = run;