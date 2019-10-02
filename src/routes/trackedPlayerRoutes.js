const express = require('express');

const requireAuth = require('../middlewares/requireAuth');
const { TrackedPlayer } = require('../db/models/TrackedPlayer');
const { TrackedPlayersOrder } = require('../db/models/TrackedPlayersOrder');

const router = express.Router();

router.use(requireAuth);

// GET /trackedPlayers
// Returns back an ORDERED list of tracked player Ids
router.get('/trackedplayers', async (req, res) => {
    const userId = req.user._id;

    try {
        const trackedPlayersOrderModel = await TrackedPlayersOrder.findOne({ userId });

        if (!trackedPlayersOrderModel) {
            return res.send([]);
        }

        res.send(trackedPlayersOrderModel);
    } catch (e) {
        res.status(422).send({ error: 'Error fetching tracked players' });
    }
});

// POST /trackedPlayer
// Adds entry into TrackedPlayer and TrackedPlayersOrder.trackedPlayersOrder
// unless this is the first time a user is tracking a player. In that case,
// a TrackedPlayersOrder is created.
router.post('/trackedPlayer', async (req, res) => {
    const { playerId } = req.body;
    const userId = req.user._id;

    if (!playerId) {
        return res.status(422).send({
            error: 'You must provide a tracked player ID.'
        });
    }

    const trackedPlayerDoc = new TrackedPlayer({ playerId, userId });

    try {
        await trackedPlayerDoc.save();

        const usersTrackedPlayersOrderModel = await TrackedPlayersOrder.findOne({ userId });

        // If its the first time a user is tracking a player
        if (!usersTrackedPlayersOrderModel) {
            try {
                const usersTrackedPlayersOrderDoc = new TrackedPlayersOrder({
                    userId,
                    trackedPlayersOrder: [playerId]
                });

                await usersTrackedPlayersOrderDoc.save();
            } catch (e) {
                res.status(422).send({
                    error: e.message
                });
            }
            // User already has tracked a player (has a trackedPlayersOrder model), push new playerId to
            // existing usersTrackedPlayersOrderModel isntead
        } else {
            usersTrackedPlayersOrderModel.trackedPlayersOrder.push(playerId);

            try {
                await usersTrackedPlayersOrderModel.save();
            } catch (e) {
                return res.status(422).send({
                    error: 'Error adding a new trackedPlayersOrder'
                });
            }
        }

        res.send(trackedPlayerDoc);
    } catch (e) {
        res.status(422).send({
            error: e.message
        });
    }
});

// DELETE /trackedPlayer
// Deletes entry from TrackedPlayer and filters out
// the tracked player from TrackedPlayersOrder.trackedPlayersOrder
router.delete('/trackedPlayer', async (req, res) => {
    const { playerId } = req.body;
    const userId = req.user._id;

    if (!playerId) {
        return res.status(422).send({
            error: 'You must provide a tracked player ID.'
        });
    }

    try {
        const trackedPlayerDoc = await TrackedPlayer.findOneAndDelete({ userId, playerId });
        const trackedPlayersOrderDoc = await TrackedPlayersOrder.findOne({ userId });

        const filteredTrackedPlayersOrder = trackedPlayersOrderDoc.trackedPlayersOrder.filter(
            _playerId => _playerId !== playerId
        );

        trackedPlayersOrderDoc.trackedPlayersOrder = filteredTrackedPlayersOrder;

        await trackedPlayersOrderDoc.save();

        res.send(trackedPlayerDoc);
    } catch (e) {
        return res.status(422).send({
            error: 'Error untracking player.'
        });
    }
});

module.exports = router;
