import axios from 'axios';
import { RecentPlayerNews } from './RecentPlayerNewsService';

const API_PORT = process.env.API_PORT || 3000;

(async () => {
    try {
        const playersResponse = await axios.get(`http://localhost:${API_PORT}/players`);
        const recentNewsResponse = await axios.get(`http://localhost:${API_PORT}/recentnews`);
        if (!recentNewsResponse.data.length) {
            console.log('No new recent news');
            return;
        }

        await RecentPlayerNews(recentNewsResponse.data[0].recentNews, playersResponse.data[0].players);
    } catch (e) {
        console.log('Error in RecentPlayerNews index:', e);
    }
})();
