const keyword_extractor = require('keyword-extractor');

function RecentPlayerNews(players, news) {
    const startTime = Date.now();
    const recentRelevantNewsCollection = [];

    news.forEach(source => {
        source.tweets.forEach(tweet => {
            const sourceText = tweet.content;
            const extraction_result = keyword_extractor.extract(sourceText, {
                language:"english",
                remove_digits: true,
                return_changed_case: false,
                remove_duplicates: false,
                return_chained_words: true
            });
            let finalSentence = '';
            
            extraction_result.forEach(sentence => {
                sentence.split(' ').forEach(word => {
                    const charCode = word.charCodeAt(0);

                    if(charCode >= 65 && charCode <= 90) {
                        finalSentence += word + ' ';
                    }
                });
            });
            
            const playerNames = [...players.keys()];

            for(let i = 0; i < playerNames.length; i++) {
                const name = playerNames[i];
                const regex = new RegExp(name, 'g');

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

    console.log('Player News Service completed in', Date.now() - startTime + 'ms');
    console.log('Total news articles returned :', recentRelevantNewsCollection.length);
    console.log();

    return recentRelevantNewsCollection;
}

module.exports = RecentPlayerNews;