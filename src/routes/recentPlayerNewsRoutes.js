const express = require('express');

const requireAuth = require('../middlewares/requireAuth');
const { UserPreferences } = require('../db/models/UserPreferences');
const { RecentPlayerNews } = require('../db/models/RecentPlayerNews');
const { asyncForEach } = require('../util/asyncForEach');

const router = express.Router();
router.use(requireAuth);

// GET /recentPlayerNews
// Returns an ordered list of recent player news for tracked players.
// The order is in order of tracked players (taken from trackedPlayerOrder)
// and by descending ordered date
router.get('/recentPlayerNews', async (req, res) => {
    const userId = req.user._id;

    try {
        const userPreferencesDoc = await UserPreferences.findOne({ userId });
        const { sortTimelineBy, trackedPlayers } = userPreferencesDoc;
        const { page } = req.query;

        const options = {
            page: parseInt(page) || 1,
            limit: 15,
            sort: { time: -1 }
        };

        // BY DATE
        if (sortTimelineBy === 0) {
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
        } else if (sortTimelineBy === 1) {
            const { playerId } = req.query;

            if (!playerId) {
                return res.status(422).send({ error: 'You must provide a playerId: ' });
            }

            try {
                const recentPlayerNewsDoc = await RecentPlayerNews.paginate({ 'player.id': playerId }, options);

                res.send(recentPlayerNewsDoc);
            } catch (e) {
                return res.status(422).send({
                    error: 'Error fetching recentPlayerNews by Player'
                });
            }
        } else {
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
