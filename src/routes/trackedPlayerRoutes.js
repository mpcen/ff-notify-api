const express = require('express');

const requireAuth = require('../middlewares/requireAuth');
const { TrackedPlayer } = require('../db/models/TrackedPlayer');
const { Player } = require('../db/models/Player');

const router = express.Router();

router.use(requireAuth);

router.get('/trackedPlayers', async (req, res) => {
    try {
        const $trackedPlayers = await TrackedPlayer.find({ userId: req.user._id });
        const trackedPlayers = await Promise.all(
            $trackedPlayers.map(async $trackedPlayer => {
                const { playerId } = $trackedPlayer;
                const [trackedPlayer] = await Player.find({ id: playerId });

                return trackedPlayer;
            })
        );

        res.send(trackedPlayers);
    } catch (e) {
        res.status(422).send({ error: 'Error fetching tracked players' });
    }
});

router.post('/trackedPlayers', async (req, res) => {
    const { playerId } = req.body;

    if (!playerId) {
        return res.status(422).send({
            error: 'You must provide a tracked player ID.'
        });
    }

    const trackedPlayer = new TrackedPlayer({ playerId, userId: req.user._id });
    const [player] = await Player.find({ id: playerId });

    try {
        await trackedPlayer.save();
        res.send(player);
    } catch (e) {
        res.status(422).send({
            error: e.message
        });
    }
});

router.delete('/trackedPlayers', async (req, res) => {
    const { playerId } = req.body;

    if (!playerId) {
        return res.status(422).send({
            error: 'You must provide a tracked player ID.'
        });
    }

    try {
        await TrackedPlayer.deleteOne({ playerId });

        const [untrackedPlayer] = await Player.find({ id: playerId });

        res.send(untrackedPlayer);
    } catch (e) {
        return res.status(422).send({
            error: 'Error untracking player.'
        });
    }
});

module.exports = router;
