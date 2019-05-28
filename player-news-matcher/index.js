const keyword_extractor = require('keyword-extractor');

function playerNewsService(playerMap, sources) {
    sources.forEach(source => {
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
            
            const playerNames = [...playerMap.keys()];

            for(let i = 0; i < playerNames.length; i++) {
                const name = playerNames[i];
                const regex = new RegExp(name, 'g');

                if(finalSentence.search(regex) > -1) {
                    console.log('Latest News For:', name);
                    console.log('  - ', sourceText);
                    console.log();
                    break;
                }
            }
        });
    });
}

module.exports = playerNewsService;