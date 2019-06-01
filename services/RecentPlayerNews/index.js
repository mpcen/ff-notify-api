const keyword_extractor = require('keyword-extractor');
const Logger = require('../../util/logger');

function RecentPlayerNews(players, news) {
    const startTime = Logger.time();
    const recentRelevantNewsCollection = [];
    const playerNames = [...players.keys()];

    news.forEach(source => {
        source.tweets.forEach(tweet => {
            const sourceText = tweet.content;
            const extraction_result = keyword_extractor.extract(sourceText, {
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
                        player: name,
                        newsText: sourceText
                    });

                    break;
                }
            }
        });
    });

    Logger.logRuntime('Player News Service completed in', startTime);
    console.log('Total news articles returned :', recentRelevantNewsCollection.length);
    console.log();

    return recentRelevantNewsCollection;
}

module.exports = RecentPlayerNews;