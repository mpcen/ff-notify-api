require('dotenv').config();

const app = require('express')();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useFindAndModify: false });
mongoose.connection.on('err', console.error.bind(console, 'DB connection error:'));
mongoose.connection.once('open', () => console.log('Connected to DB:', process.env.NODE_ENV));

const RecentNews = require('./db/models/RecentNews');
const RecentPlayerNews = require('./db/models/RecentPlayerNews');
const Player = require('./db/models/Player');
// const { emitter } = require('../websocket/index.ts');

app.use(bodyParser.json({ limit: '999kb' }));

app.get('/players', async (req, res) => {
    try {
        const response = await Player.find();
        res.send(response);
    } catch (e) {
        console.log('Error from GET /players:', e);
        res.sendStatus(500);
    }
});

app.post('/players', async (req, res) => {
    try {
        const doc = await Player.insertMany(req.body);
        console.log('Stored new Player Data');
        res.send(doc);
    } catch (e) {
        console.log('Error from POST /players:', e);
        res.sendStatus(501);
    }
});

app.put('/players', async (req, res) => {
    const { action, players } = req.body;

    try {
        if (action === 'ADD') {
            const doc = await Player.insertMany(players);

            res.send(doc);
        } else if (action === 'UPDATE') {
            const doc = await Promise.all(players.map(({ id, teamId }) => Player.findOneAndUpdate({ id }, { teamId })));

            res.send(players);
        }
    } catch (e) {
        console.log('Error from PUT /players:', e.message);
        res.sendStatus(500);
    }
});

app.get('/recentPlayerNews', async (req, res) => {
    try {
        const response = await RecentPlayerNews.find();
        res.send(response);
    } catch (e) {
        console.log('Error GET /recentPlayerNews:', e);
        res.sendStatus(500);
    }
});

app.post('/recentPlayerNews', async (req, res) => {
    try {
        const storedRecentPlayerNews = await RecentPlayerNews.find();
        const newRecentPlayerNews = [];

        if (!storedRecentPlayerNews.length) {
            const doc = await RecentPlayerNews.create(req.body);

            console.log('Stored', req.body.length, 'new recent player news items');
            return res.send(doc);
        }

        req.body.forEach(incomingRecentPlayerNewsItem => {
            const item = storedRecentPlayerNews.find(storedRecentPlayerNewsItem => {
                return (
                    storedRecentPlayerNewsItem.platform === incomingRecentPlayerNewsItem.platform &&
                    storedRecentPlayerNewsItem.contentId === incomingRecentPlayerNewsItem.contentId
                );
            });

            if (!item) newRecentPlayerNews.push(incomingRecentPlayerNewsItem);
        });

        if (newRecentPlayerNews.length) {
            await RecentPlayerNews.insertMany(newRecentPlayerNews);
            // emitter.emit('alert', newRecentPlayerNews);
            console.log('Stored', newRecentPlayerNews.length, 'new recent player news items:');
        } else {
            console.log('No new recent player news');
        }

        await RecentNews.deleteOne();
        res.sendStatus(200);
    } catch (e) {
        console.log('Error in POST /recentPlayerNews:', e);
        res.sendStatus(500);
    }
});

app.listen(PORT, () => console.log(`API running on PORT: ${PORT}`));
