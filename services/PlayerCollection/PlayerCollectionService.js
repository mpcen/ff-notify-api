const cheerio = require('cheerio');
const axios = require('axios');

const TEAMS_NFL_COM = require('./teams.json');
const util_timeout = require('../../util/timeout');
const util_suffixes = require('../../util/suffixes');

class PlayerCollectionService {
    constructor(options) {
        this.runTimes = options.runTimes;
        this.delay = options.delay;
        this.totalTeamsScanned = 0;
        this.totalPlayersScanned = 0;
    }

    async run() {
        let teamsWithPlayers;
        let players;

        while(this.runTimes) {
            let startTime = Date.now();
            this.totalTeamsScanned = 0;
            this.totalPlayersScanned = 0;
    
            try {
                teamsWithPlayers = await this.fetchTeamsWithPlayers(TEAMS_NFL_COM);
            } catch(e) {
                console.log('Error from within PlayerCollectionService run:', e);
                return {};
            }

            console.log('Player Collection Scan completed in', Date.now() - startTime + 'ms');
            console.log('Total Teams Scanned:', this.totalTeamsScanned);
            console.log('Total Players discovered:', this.totalPlayersScanned);
            console.log();
            
            if(typeof this.runTimes === 'number') this.runTimes--;

            players = this.flattenPlayers(teamsWithPlayers);

            try {
                await axios.post('http://localhost:5000/players', players);
            } catch(e) {
                console.log('Error in PlayerServices run:', e);
                return {};
            }

            await util_timeout(this.delay); 
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
            return await Promise.all(promises);
        } catch(e) {
            console.log('Error in fetchTeamsWithPlayers:', e);
            return {};
        }
    }

    async fetchNFLPlayer(team) {
        let response;

        try {
            response = await axios.get(team.url);
        } catch(e) {
            console.log('Error in fetchNFLPlayer:', e);
            return {};
        }

        const $ = cheerio.load(response.data);
        console.log('Gathering', team.name, 'players');

        const $players =  $('tbody.Table2__tbody tr');
        
        const players = [];
    
        $players.each((i, elem) => {
            let $player = $(elem).find('td.Table2__td');
            let playerName = $player.find('span').children().eq(1).text();
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
                college: $player.children().eq(7).text(),
                teamId: team.id,
                position: $player.children().eq(2).text(),
                number: $(elem).find('span span').text(),
            };
    
            this.totalPlayersScanned++;

            players.push(player);
        });
        
        return players;
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