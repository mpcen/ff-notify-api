const RecentPlayerNewsService = require('./RecentPlayerNewsService');
const axios = require('axios');

(async () => {
    try {
        const playersResponse = await axios.get('http://localhost:5000/players');
        const recentNewsResponse = await axios.get('http://localhost:5000/recentnews');

        if(!recentNewsResponse.data.length) {
            console.log('No new recent news');
            return;
        }
        
        await RecentPlayerNewsService(
            playersResponse.data[0].players,
            recentNewsResponse.data[0].recentNews
        );
    } catch(e) {
        console.log('Error in RecentPlayerNews index:', e);
    }
})();