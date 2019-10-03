const express = require('express');

const requireAuth = require('../middlewares/requireAuth');
const { RecentNews } = require('../db/models/RecentNews');
const { RecentPlayerNews } = require('../db/models/RecentPlayerNews');
const { TrackedPlayersOrder } = require('../db/models/TrackedPlayersOrder');
const { TrackedPlayer } = require('../db/models/TrackedPlayer');
const { asyncForEach } = require('../util/asyncForEach');

const router = express.Router();
router.use(requireAuth);

// GET /recentPlayerNews
// Returns an ordered list of recent player news for tracked players.
// The order is in order of tracked players (taken from trackedPlayerOrder)
// and by descending ordered date
router.get('/recentPlayerNews', async (req, res) => {
    const userId = req.user._id;
    const timelineSortBy = req.user.preferences.timelineSortBy;

    if (timelineSortBy === 0) {
        const { page } = req.query;
        const options = {
            page: parseInt(page) || 1,
            limit: 15,
            sort: { time: -1 }
        };

        try {
            const trackedPlayersOrderDoc = await TrackedPlayersOrder.findOne({ userId });
            const recentPlayerNewsDoc = await RecentPlayerNews.paginate(
                {
                    'player.id': {
                        $in: trackedPlayersOrderDoc.trackedPlayersOrder
                    }
                },
                options
            );

            res.send(recentPlayerNewsDoc);
        } catch (e) {
            console.log(e);

            return res.status(422).send({
                error: 'Error fetching recentPlayerNewsForUser by Date'
            });
        }
    } else if (timelineSortBy === 1) {
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
                error: 'Error fetching recentPlayerNewsForUser by Player'
            });
        }
    } else {
        return res.status(422).send({
            error: 'Unknown Error when fetching recentPlayerNewsForUser'
        });
    }
});

// POST /recentPlayerNews
// Posts a list of recent player news
// req.body contains the payload of scraped/built recent player news
// which can cantain already-stored recent player news
router.post('/recentPlayerNews', async (req, res) => {
    const recentPlayerNews = req.body;
    let storedRecords = 0;

    try {
        await asyncForEach(recentPlayerNews, async recentPlayerNewsArticle => {
            try {
                await RecentPlayerNews.create(recentPlayerNewsArticle);
                storedRecords++;
            } catch (e) {}
        });

        console.log('Stored', storedRecords, 'new recent player news items');
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(500);
    }
});

module.exports = router;
