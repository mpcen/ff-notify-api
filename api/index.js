const app = require('express')();
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/FFNotify', { useNewUrlParser: true });
mongoose.connection.on('err', console.error.bind(console, 'DB connection error:'));
mongoose.connection.once('open', () => console.log('Connected to DB'));

const RecentNews = require('../db/models/RecentNews');
const RecentPlayerNews = require('../db/models/RecentPlayerNews');
const Players = require('../db/models/Players');

app.use(bodyParser.json({ limit: '999kb' }));

app.get('/recentNews', async (req, res) => {
    try {
        const response = await RecentNews.find();
        res.send(response);
    } catch(e) {
        console.log('Error in GET /recentNews:', e);
        res.sendStatus(500);
    }
});

app.post('/recentNews', async (req, res) => {
    const recentNews = new RecentNews({
        name: 'twitter',
        recentNews: req.body.recentNews
    });
        
    try {
        await recentNews.save();
    } catch(e) {
        console.log('Error from POST /recentNews:', e);
        res.sendStatus(500);
    }
    console.log('Stored new Twitter Data');

    return res.sendStatus(200);
});

app.get('/players', async (req, res) => {
    try {
        const response = await Players.find();
        res.send(response);
    } catch(e) {
        console.log('Error from GET /players:', e);
        res.sendStatus(500);
    }
});

app.post('/players', async (req, res) => {
    const players = new Players({ players: req.body });

    try {
        await players.save();
        console.log('Stored new Player Data');
    } catch(e) {
        console.log('Error from POST /players:', e);
        res.sendStatus(501);
    }

    return res.sendStatus(200);
});

app.get('/recentPlayerNews', async (req, res) => {
    try {
        const response = await RecentPlayerNews.find();
        res.send(response);
    } catch(e) {
        console.log('Error GET /recentPlayerNews:', e);
        res.sendStatus(500);
    }
});

app.post('/recentPlayerNews', async (req, res) => {
    try {
        const $currentRecentPlayerNews = await RecentPlayerNews.find();
        const newRecentPlayerNews = [];

        if(!$currentRecentPlayerNews.length) {
            await RecentPlayerNews.create(req.body);
            await RecentNews.deleteOne();
            console.log('Stored', req.body.length, 'new recent player news items');
            return res.sendStatus(200);
        }

        req.body.forEach(incomingRecentPlayerNewsItem => {
            const item = $currentRecentPlayerNews.find($currentRecentPlayerNewsItem => {
                return $currentRecentPlayerNewsItem.platform === incomingRecentPlayerNewsItem.platform &&
                    $currentRecentPlayerNewsItem.contentId === incomingRecentPlayerNewsItem.contentId
            });

            if(!item) newRecentPlayerNews.push(incomingRecentPlayerNewsItem);
        });

        if(newRecentPlayerNews.length) {
            await RecentPlayerNews.insertMany(newRecentPlayerNews);
            console.log('Stored', newRecentPlayerNews.length, 'new recent player news items');
        } else {
            console.log('No new recent player news');
        }

        await RecentNews.deleteOne();
        res.sendStatus(200);
    } catch(e) {
        console.log('Error in POST /recentPlayerNews:', e);
        res.sendStatus(500);
    }
});

app.listen(PORT, () => console.log('API Running on port', PORT));