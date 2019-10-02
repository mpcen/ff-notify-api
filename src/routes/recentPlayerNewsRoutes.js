const express = require('express');

const requireAuth = require('../middlewares/requireAuth');
const { RecentNews } = require('../db/models/RecentNews');
const { RecentPlayerNews } = require('../db/models/RecentPlayerNews');
const { TrackedPlayersOrder } = require('../db/models/TrackedPlayersOrder');

const router = express.Router();
router.use(requireAuth);

// GET /recentPlayerNews
// Returns an ordered list of recent player news for tracked players.
// The order is in order of tracked players (taken from trackedPlayerOrder)
// and by descending ordered date
router.get('/recentPlayerNewsByPlayer', async (req, res) => {
    const userId = req.user._id;

    try {
        const trackedPlayersOrderDoc = await TrackedPlayersOrder.findOne({ userId });
        const orderedRecentPlayerNewsDocs = await Promise.all(
            trackedPlayersOrderDoc.trackedPlayersOrder.map(async orderedTrackedPlayerId => {
                const recentPlayerNewsDoc = await RecentPlayerNews.find({
                    'player.id': orderedTrackedPlayerId
                }).sort({ time: -1 });

                return recentPlayerNewsDoc;
            })
        );

        const merged = [];

        orderedRecentPlayerNewsDocs.forEach(item => {
            merged.push(...item);
        });

        res.send(merged);
    } catch (e) {
        return res.status(422).send({
            error: 'Error fetching recentPlayerNewsForUser'
        });
    }
});

router.post('/recentPlayerNews', async (req, res) => {
    try {
        const storedRecentPlayerNews = await RecentPlayerNews.find();
        const newRecentPlayerNews = [];

        if (!storedRecentPlayerNews.length) {
            const recentPlayerNewsDoc = await RecentPlayerNews.create(req.body);

            console.log('Stored', req.body.length, 'new recent player news items');
            return res.send(recentPlayerNewsDoc);
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
