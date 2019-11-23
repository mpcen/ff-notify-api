const express = require('express');

const requireAuth = require('../middlewares/requireAuth');
const { UserPreferences } = require('../db/models/UserPreferences');
const { RecentPlayerNews } = require('../db/models/RecentPlayerNews');
const { asyncForEach } = require('../util/asyncForEach');

const router = express.Router();
router.use(requireAuth);

router.get('/playerNews', async (req, res) => {
    const userId = req.user._id;
    const { playerId, page, newsType } = req.query;
    const options = {
        page: parseInt(page) || 1,
        limit: 50,
        sort: { time: -1 }
    };

    // INDIVIDUAL
    if (newsType == 0) {
        try {
            const recentPlayerNewsDoc = await RecentPlayerNews.paginate({ 'player.id': playerId }, options);

            return res.send(recentPlayerNewsDoc);
        } catch (e) {
            return res.status(422).send({
                error: 'Error fetching recentPlayerNews by Individual'
            });
        }
    }

    // ALL TRACKED
    if (newsType == 1) {
        try {
            const userPreferencesDoc = await UserPreferences.findOne({ userId });
            const { trackedPlayers } = userPreferencesDoc;
            const recentPlayerNewsDoc = await RecentPlayerNews.paginate(
                { 'player.id': { $in: trackedPlayers } },
                options
            );

            return res.send(recentPlayerNewsDoc);
        } catch (e) {
            return res.status(422).send({ error: 'Error fetching recentPlayerNews by All Tracked' });
        }
    }

    // ALL
    if (newsType == 2) {
        try {
            const recentPlayerNewsDoc = await RecentPlayerNews.paginate({}, options);

            return res.send(recentPlayerNewsDoc);
        } catch (e) {
            return res.status(422).send({ error: 'Error fetching allPlayerNews' });
        }
    }
});

// POST /playerNews
// Posts a list of recent player news
// req.body contains the payload of scraped/built recent player news
// which can cantain already-stored recent player news
router.post('/playerNews', async (req, res) => {
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
