
const cheerio = require('cheerio');
const request = require('request-promise');
const axios = require('axios');

const TEAMS_NFL_COM = require('./teams.json');
const util_timeout = require('../../util/timeout');
const util_suffixes = require('../../util/suffixes');

class PlayerCollectionService {
    constructor() {
        this.totalTeamsScanned = 0;
        this.totalPlayersScanned = 0;
    }

    async run({ runTimes, delay }) {
        let teamsWithPlayers;

        while(runTimes) {
            let startTime = Date.now();
            this.totalTeamsScanned = 0;
            this.totalPlayersScanned = 0;
    
            try {
                teamsWithPlayers = await this.fetchTeamsWithPlayers(TEAMS_NFL_COM);
            } catch(e) {
                // Prob wanna throw something so api can catch it
                console.log('Error from within PlayerCollectionService run:', e);
                return {};
            }

            //console.log('response:', JSON.stringify(response, undefined, 2));
            console.log('Player Collection Scan completed in', Date.now() - startTime + 'ms');
            console.log('Total Teams Scanned:', this.totalTeamsScanned);
            console.log('Total Players Scanned:', this.totalPlayersScanned);
            console.log();
            
            if(typeof runTimes === 'number') runTimes--;

            await util_timeout(delay); 

            const players = this.flattenPlayers(teamsWithPlayers);

            try {
                await axios.post('http://localhost:5000/players', players);
            } catch(e) {
                // Prob wanna throw something so api can catch it
                console.log('Error in PlayerServices run:', e);
                return {};
            }
        }

        return players;
    }

    async fetchTeamsWithPlayers(TEAMS_NFL_COM) {
        const promises = [];
    
        TEAMS_NFL_COM.teams.forEach(team => {
            promises.push(
                new Promise((resolve, reject) => {
                    return this.fetchNFLPlayer(team)
                        .then(response => {
                            this.totalTeamsScanned++;
                            resolve(response)
                        })
                        .catch(err => reject(err));
                })
            );
        });
        
        try {
            const response = await Promise.all(promises).then(response => response);
            return response;
        } catch(e) {
            // Prob wanna throw something so api can catch it
            console.log('Error in fetchTeamsWithPlayers:', e);
            return {};
        }
    }

    async fetchNFLPlayer(team) {
        const ROUTE = 'team/players-roster/';
        const URL = `https://${team.url}/${ROUTE}`;

        try {
            const $ = await request(URL).then(response => cheerio.load(response)).catch(err => err);
            const $players =  $('table tbody tr').find('.sorter-lastname');
            const players = [];
        
            $players.each((i, elem) => {
                let playerName = $(elem).find('div span a').text();
                let name_split = playerName.split(' ');
                let maybeSuffix = name_split[name_split.length - 1];
        
                if(!util_suffixes.has(maybeSuffix)) {
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
        
                this.totalPlayersScanned++;

                players.push(player);
            });
            
            return players;
        } catch(e) {
            // Prob wanna throw something so api can catch it
            console.log('Error in fetchNFLPlayer:', e);
            return {};
        }
    }

    flattenPlayers(teams) {
        const playerMap = new Map();
        const flattenedPlayers = [];
    
        teams.forEach(players => {
            players.forEach(player => {
                if(!playerMap.has(player.name)) {
                    playerMap.set(player.name, [player]);
                } else {
                    playerMap.get(player.name).push(player);
                }
            });
        });

        playerMap.forEach(players => {
            players.forEach(player => flattenedPlayers.push(player));
        });

        return flattenedPlayers;
    }
}

module.exports = PlayerCollectionService;