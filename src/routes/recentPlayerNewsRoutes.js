const express = require('express');

const router = express.Router();
const RecentNews = require('../db/models/RecentNews');
const RecentPlayerNews = require('../db/models/RecentPlayerNews');

router.get('/recentPlayerNews', async (req, res) => {
    try {
        const response = await RecentPlayerNews.find();
        res.send(response);
    } catch (e) {
        console.log('Error GET /recentPlayerNews:', e);
        res.sendStatus(500);
    }
});

router.post('/recentPlayerNews', async (req, res) => {
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

module.exports = router;