const axios = require('axios');
const Logger = require('../../util/logger');

async function RecentPlayerNews(news, players) {
    const startTime = Logger.time();
    const recentRelevantNewsCollection = [];
    const playerNames = [];

    players.forEach(player => playerNames.push(player.name));

    news.forEach(source => {
        const { username, platform } = source;

        source.tweets.forEach(tweet => {
            const { content, id, time } = tweet;

            for(let i = 0; i < playerNames.length; i++) {
                const name = playerNames[i];
                const regex = new RegExp(name, 'gi');

                if(content.search(regex) > -1) {
                    recentRelevantNewsCollection.push({
                        platform,
                        username,
                        contentId: id,
                        player: name,
                        content,
                        time,
                    });

                    break;
                }
            }
        });
    });

    try {
        await axios.post(
            'http://localhost:5000/recentPlayerNews',
            recentRelevantNewsCollection
        );
    } catch(e) {
        console.log('Error in RecentPlayerNews:', e);
        return {};
    }

    Logger.logRuntime('Player News Service completed in', startTime);

    return recentRelevantNewsCollection;
}

module.exports = RecentPlayerNews;