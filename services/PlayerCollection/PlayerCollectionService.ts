import * as cheerio from 'cheerio';
import axios, { AxiosResponse } from 'axios';

import { teams as TEAMS_NFL_COM } from './teams';
import { util_timeout } from '../../util/timeout';
import { SUFFIXES } from '../../util/suffixes';
import { ITeam } from './teams';

const PORT = process.env.PORT || 3000;

export interface IPlayer {
    id: string;
    name: string;
    college: string;
    suffix: string;
    teamId: number;
    number: string;
    position: string;
    avatarUrl: string;
}

export class PlayerCollectionService {
    runTimes: number;
    delay: number;
    totalTeamsScanned: number;
    totalPlayersScanned: number;

    constructor({ runTimes, delay }: { runTimes: number; delay: number }) {
        this.runTimes = runTimes;
        this.delay = delay;
        this.totalTeamsScanned = 0;
        this.totalPlayersScanned = 0;
    }

    async run(): Promise<void> {
        const newPlayers: IPlayer[] = [];
        const updatedPlayers: IPlayer[] = [];
        let teamsWithPlayers: IPlayer[][] = [];
        let discoveredPlayers: IPlayer[] = [];
        let storedPlayers: IPlayer[] = [];

        while (this.runTimes) {
            let startTime = Date.now();
            this.totalTeamsScanned = 0;
            this.totalPlayersScanned = 0;

            try {
                teamsWithPlayers = await this.fetchTeamsWithPlayers(TEAMS_NFL_COM);
            } catch (e) {
                console.log('Error from within PlayerCollectionService run:', e.message);
                throw new Error(e.message);
            }

            console.log('Player Collection Scan completed in', Date.now() - startTime + 'ms');
            console.log('Total Teams Scanned:', this.totalTeamsScanned);
            console.log('Total Players discovered:', this.totalPlayersScanned);
            console.log();

            if (typeof this.runTimes === 'number') this.runTimes--;

            discoveredPlayers = this.flattenPlayers(teamsWithPlayers);

            try {
                const storedPlayersResponse: AxiosResponse = await axios.get(`http://localhost:${PORT}/players`);

                storedPlayers = storedPlayersResponse.data;

                // seed db
                if (!storedPlayers.length) {
                    await axios.post(`http://localhost:${PORT}/players`, discoveredPlayers);

                    console.log('Seeded players.');
                    return;
                }

                discoveredPlayers.forEach((discoveredPlayer: IPlayer) => {
                    const storedPlayer = storedPlayers.find((storedPlayer: IPlayer) => {
                        return discoveredPlayer.id === storedPlayer.id;
                    });

                    // if player is new
                    if (!storedPlayer) {
                        newPlayers.push(discoveredPlayer);
                    }

                    // if existing player switched teams
                    else if (storedPlayer.teamId !== discoveredPlayer.teamId) {
                        updatedPlayers.push(storedPlayer);
                    }
                });

                if (!newPlayers.length && !updatedPlayers.length) {
                    console.log('No player data stored.');
                    return;
                }

                if (newPlayers.length) {
                    await axios.put(`http://localhost:${PORT}/players`, {
                        action: 'ADD',
                        players: newPlayers
                    });

                    console.log(newPlayers.length, 'new players added');
                }

                if (updatedPlayers.length) {
                    await axios.put(`http://localhost:${PORT}/players`, {
                        action: 'UPDATE',
                        players: updatedPlayers
                    });

                    console.log(newPlayers.length, 'players updated');
                }

                console.log('Finished storing players');
            } catch (e) {
                console.log('Error in PlayerServices run:', e.message);
                throw new Error(e.message);
            }

            await util_timeout(this.delay.toString());
        }
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

            if (SUFFIXES.has(maybeSuffix)) {
                maybeSuffix = name_split.pop();
            } else {
                maybeSuffix = '';
            }

            playerName = name_split.join(' ');

            const player: IPlayer = {
                id: '',
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
                    .text(),
                avatarUrl:
                    $player
                        .children()
                        .eq(0)
                        .find('img')
                        .attr('alt') || ''
            };

            // TODO: Make an actual HEX ID.
            player.id = player.name + player.college + player.position;

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
