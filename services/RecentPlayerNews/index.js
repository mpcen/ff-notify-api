const RecentPlayerNewsService = require('./RecentPlayerNewsService');
const axios = require('axios');

(async () => {
    const playersResponse = await axios.get('http://localhost:5000/players');
    const recentNewsResponse = await axios.get('http://localhost:5000/recentnews');
    
    await RecentPlayerNewsService(
        playersResponse.data[0].players,
        recentNewsResponse.data[0].recentNews
    );
})();