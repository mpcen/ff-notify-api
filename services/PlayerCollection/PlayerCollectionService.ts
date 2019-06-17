import * as cheerio from 'cheerio';
import axios, { AxiosResponse } from 'axios';

import { teams as TEAMS_NFL_COM } from './teams';
import { util_timeout } from '../../util/timeout';
import { SUFFIXES } from '../../util/suffixes';
import { ITeam } from './teams';

export interface IPlayer {
    name: string;
    college: string;
    suffix?: string;
    teamId: number;
    number: string;
    position: string;
}

export class PlayerCollectionService {
    runTimes: number;
    delay: string;
    totalTeamsScanned: number;
    totalPlayersScanned: number;

    constructor({ runTimes, delay }: { runTimes: number; delay: string }) {
        this.runTimes = runTimes;
        this.delay = delay;
        this.totalTeamsScanned = 0;
        this.totalPlayersScanned = 0;
    }

    async run(): Promise<IPlayer[]> {
        let teamsWithPlayers: IPlayer[][] = [];
        let players: IPlayer[] = [];

        while (this.runTimes) {
            let startTime = Date.now();
            this.totalTeamsScanned = 0;
            this.totalPlayersScanned = 0;

            try {
                teamsWithPlayers = await this.fetchTeamsWithPlayers(TEAMS_NFL_COM);
            } catch (e) {
                console.log('Error from within PlayerCollectionService run:', e);
                return [];
            }

            console.log('Player Collection Scan completed in', Date.now() - startTime + 'ms');
            console.log('Total Teams Scanned:', this.totalTeamsScanned);
            console.log('Total Players discovered:', this.totalPlayersScanned);
            console.log();

            if (typeof this.runTimes === 'number') this.runTimes--;

            players = this.flattenPlayers(teamsWithPlayers);

            try {
                await axios.post('http://localhost:5000/players', players);
            } catch (e) {
                console.log('Error in PlayerServices run:', e);
                return [];
            }

            await util_timeout(this.delay);
        }

        return players;
    }

    async fetchTeamsWithPlayers(TEAMS_NFL_COM: ITeam[]): Promise<IPlayer[][]> {
        const promises: Promise<IPlayer[]>[] = [];

        await TEAMS_NFL_COM.forEach(team => {
            promises.push(
                new Promise(resolve =>
                    this.fetchNFLPlayers(team).then(response => {
                        this.totalTeamsScanned++;
                        return resolve(response);
                    })
                )
            );
        });

        try {
            return await Promise.all(promises);
        } catch (e) {
            console.log('Error in fetchTeamsWithPlayers:', e);
            return [];
        }
    }

    async fetchNFLPlayers(team: ITeam): Promise<IPlayer[]> {
        let response: AxiosResponse<string>;

        try {
            response = await axios.get(team.url);
        } catch (e) {
            console.log('Error in fetchNFLPlayer:', e);
            return [];
        }

        const $ = cheerio.load(response.data);
        console.log('Gathering', team.name, 'players');

        const $players = $('tbody.Table2__tbody tr');

        const players: IPlayer[] = [];

        $players.each((i, elem) => {
            let $player = $(elem).find('td.Table2__td');
            let playerName = $player
                .find('span')
                .children()
                .eq(1)
                .text();
            let name_split = playerName.split(' ');
            let maybeSuffix = name_split[name_split.length - 1];

            if (!SUFFIXES.has(maybeSuffix)) {
                maybeSuffix = '';
            } else {
                name_split.pop();
                playerName = name_split.join(' ');
            }

            const player: IPlayer = {
                name: playerName,
                suffix: maybeSuffix,
                college: $player
                    .children()
                    .eq(7)
                    .text(),
                teamId: team.id,
                position: $player
                    .children()
                    .eq(2)
                    .text(),
                number: $(elem)
                    .find('span span')
                    .text()
            };

            this.totalPlayersScanned++;

            players.push(player);
        });

        return players;
    }

    flattenPlayers(teams: IPlayer[][]): IPlayer[] {
        const playerMap = new Map<string, IPlayer[]>();
        const flattenedPlayers: IPlayer[] = [];

        teams.forEach(players => {
            players.forEach(player => {
                if (!playerMap.has(player.name)) {
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
