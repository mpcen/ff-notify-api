import axios, { AxiosResponse } from 'axios';
import { util_timeout } from '../util/timeout';

import { RecentNewsService, IRecentNewsSource } from './RecentNews/RecentNewsService';
import { RecentPlayerNews } from './RecentPlayerNews/RecentPlayerNewsService';

(async () => {
    console.log('Starting Services...');
    const TIMEOUT = process.argv[2] || '3000';
    const recentNewsService = new RecentNewsService({ runTimes: 1, delay: 0 });
    let response: AxiosResponse;

    try {
        response = await axios.get('http://localhost:5000/players');
    } catch (e) {
        console.log('Error in main playersResponse:', e);
    }

    while (true) {
        console.log();

        let recentNews: IRecentNewsSource[];

        try {
            recentNews = await recentNewsService.run();
            await RecentPlayerNews(recentNews, response.data[0].players);
        } catch (e) {
            console.log('Error main:', e);
        }

        recentNewsService.runTimes = 1;

        console.log('Timing out for', TIMEOUT + 'ms');
        await util_timeout(TIMEOUT);
    }
})();
