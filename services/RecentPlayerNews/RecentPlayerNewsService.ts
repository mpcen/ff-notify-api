import axios from 'axios';

import { Logger } from '../../util/logger';
import { IRecentNewsSource } from '../RecentNews/RecentNewsService';
import { IPlayer } from '../PlayerCollection/PlayerCollectionService';

const API_PORT = process.env.API_PORT || 3000;

interface IRecentPlayerNewsArticle {
    platform: string;
    username: string;
    contentId: string;
    player: IPlayer;
    content: string;
    time: string;
}

export async function RecentPlayerNews(
    news: IRecentNewsSource[],
    storedPlayers: IPlayer[]
): Promise<IRecentPlayerNewsArticle[]> {
    const startTime = Logger.time();
    const recentPlayerNews: IRecentPlayerNewsArticle[] = [];

    news.forEach(source => {
        const { username, platform } = source;

        source.tweets.forEach(tweet => {
            const { content, id, time } = tweet;

            for (let i = 0; i < storedPlayers.length; i++) {
                const name = storedPlayers[i].name;
                const regex = new RegExp(name, 'gi');

                if (content.search(regex) > -1) {
                    recentPlayerNews.push({
                        platform,
                        username,
                        contentId: id,
                        player: storedPlayers[i],
                        content,
                        time
                    });

                    break;
                }
            }
        });
    });

    try {
        await axios.post(`http://localhost:${API_PORT}/recentPlayerNews`, recentPlayerNews);
    } catch (e) {
        console.log('Error in RecentPlayerNews:', e.message);
        return [];
    }

    Logger.logRuntime('Player News Service completed in', startTime);

    return recentPlayerNews;
}
