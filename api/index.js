const app = require('express')();
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/FFNotify', { useNewUrlParser: true });
mongoose.connection.on('err', console.error.bind(console, 'DB connection error:'));
mongoose.connection.once('open', () => console.log('Connected to DB'));

const RecentNews = require('../db/models/RecentNews');

app.use(bodyParser.json());

app.get('/recentNews', (req, res) => {
    RecentNews.find((err, response) => {
        res.send(response);
    });
});

app.post('/recentNews', async (req, res) => {
    const $twitter = await RecentNews.findOne({ 'name': 'twitter' });
    const newTweets = [];

    $twitter.recentNews.forEach($twitterUser => {
        const twitterUser = req.body.recentNews.find(twitterUser => {
            return $twitterUser.username === twitterUser.username;
        });

        const $tweets = $twitterUser.tweets;
        
        twitterUser.tweets.forEach(recentlyScrapedTweet => {
            if(!$tweets.find($tweet => $tweet.id === recentlyScrapedTweet.id)) {
                newTweets.push({ _id: $twitterUser._id, data: recentlyScrapedTweet });
            }
        });
    });

    if(newTweets.length) {
        console.log('New Tweets:', newTweets);

        newTweets.forEach(async newTweet => {
            const $twitterUser = $twitter.recentNews.find($twitterUser => $twitterUser._id === newTweet._id);
            $twitterUser.tweets.unshift(newTweet.data);
        });

        await $twitter.save();
    } else {
        console.log('No new tweets');
    }

    res.sendStatus(200);

    // const recentNews = new RecentNews(req.body);
    // recentNews.save((err, data) => {
    //     console.log('Saved:', data);
    //     res.sendStatus(200);
    // });
});

app.listen(PORT, () => console.log('API Running on port', PORT));