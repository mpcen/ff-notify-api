const keyword_extractor = require('keyword-extractor');
const axios = require('axios');

const Logger = require('../../util/logger');

async function RecentPlayerNews(players, news) {
    const startTime = Logger.time();
    const recentRelevantNewsCollection = [];
    const playerNames = [];

    players.forEach(player => playerNames.push(player.name));

    news.forEach(source => {
        const { username } = source;

        source.tweets.forEach(tweet => {
            const { content, id } = tweet;
            const extraction_result = keyword_extractor.extract(content, {
                language: "english",
                remove_digits: true,
                return_changed_case: false,
                remove_duplicates: false,
                return_chained_words: true
            });
            let finalSentence = extraction_result.join(' ');

            for(let i = 0; i < playerNames.length; i++) {
                const name = playerNames[i];
                const regex = new RegExp(name, 'gi');

                if(finalSentence.search(regex) > -1) {
                    recentRelevantNewsCollection.push({
                        platform: 'twitter',
                        username,
                        contentId: id,
                        player: name,
                        content
                    });

                    break;
                }
            }
        });
    });

    Logger.logRuntime('Player News Service completed in', startTime);
    console.log('Total news articles returned :', recentRelevantNewsCollection.length);
    console.log(recentRelevantNewsCollection);
    console.log();

    try {
        await axios.post('http://localhost:5000/recentPlayerNews', recentRelevantNewsCollection);
        console.log('Stored:', recentRelevantNewsCollection.length, 'relevant player alerts')
    } catch(e) {
        console.log('Error in RecentPlayerNews:', e);
        return {};
    }

    return recentRelevantNewsCollection;
}

module.exports = RecentPlayerNews;