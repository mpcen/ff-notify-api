const express = require('express');

const requireAuth = require('../middlewares/requireAuth');
const { UserPreferences } = require('../db/models/UserPreferences');
const { RecentPlayerNews } = require('../db/models/RecentPlayerNews');
const { asyncForEach } = require('../util/asyncForEach');

const router = express.Router();
router.use(requireAuth);

// GET /allNews
// Returns all latest news
router.get('/allPlayerNews', async (req, res) => {
    const { page } = req.query;
    const options = {
        page: parseInt(page) || 1,
        limit: 50,
        sort: { time: -1 }
    };

    try {
        const recentPlayerNewsDoc = await RecentPlayerNews.paginate({}, options);

        res.send(recentPlayerNewsDoc);
    } catch (e) {
        return res.status(422).send({ error: 'Error fetching allPlayerNews' });
    }
});

// GET /recentPlayerNews
// Returns an ordered list of recent player news for tracked players.
// The order is in order of tracked players (taken from trackedPlayerOrder)
// and by descending ordered date
router.get('/recentPlayerNews', async (req, res) => {
    const userId = req.user._id;

    try {
        const userPreferencesDoc = await UserPreferences.findOne({ userId });

        console.log('userPreferencesDoc:', userPreferencesDoc);

        const { timelineSortType, trackedPlayers } = userPreferencesDoc;

        console.log('timelineSortType:', timelineSortType);
        console.log('trackedPlayers:', trackedPlayers);

        const { page } = req.query;

        const options = {
            page: parseInt(page) || 1,
            limit: 50,
            sort: { time: -1 }
        };

        console.log('options:', options);

        // BY DATE
        if (timelineSortType === 0) {
            console.log('timelineSortType === 0');

            try {
                const recentPlayerNewsDoc = await RecentPlayerNews.paginate(
                    { 'player.id': { $in: trackedPlayers } },
                    options
                );

                res.send(recentPlayerNewsDoc);
            } catch (e) {
                return res.status(422).send({ error: 'Error fetching recentPlayerNews by Date' });
            }

            // BY PLAYER
        } else if (timelineSortType === 1) {
            console.log('timelineSortType === 1');

            const { playerId } = req.query;

            if (!playerId) {
                return res.status(422).send({ error: 'You must provide a playerId: ' });
            }

            try {
                const recentPlayerNewsDoc = await RecentPlayerNews.paginate(
                    { 'player.id': playerId },
                    options
                );

                res.send(recentPlayerNewsDoc);
            } catch (e) {
                return res.status(422).send({
                    error: 'Error fetching recentPlayerNews by Player'
                });
            }
        } else {
            console.log('unknown error');

            return res.status(422).send({
                error: 'Unknown Error when fetching recentPlayerNews by Player'
            });
        }
    } catch (e) {
        res.sendStatus(422).send({ error: 'Error getting user recentPlayerNews: ' + e.message });
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
            const { contentId, platform, player } = recentPlayerNewsArticle;
            const exists = await RecentPlayerNews.findOne({
                contentId,
                platform,
                'player.id': player.id
            });

            if (!exists) {
                try {
                    await RecentPlayerNews.create(recentPlayerNewsArticle);
                    storedRecords++;
                } catch (e) {
                    console.log('Error in POST /recentplayernews asyncForEach:', e);
                    res.sendStatus(500);
                }
            }
        });

        console.log('Stored', storedRecords, 'new recent player news items');
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(500);
    }
});

module.exports = router;
