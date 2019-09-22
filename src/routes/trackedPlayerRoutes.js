const express = require('express');

const requireAuth = require('../middlewares/requireAuth');
const { TrackedPlayer } = require('../db/models/TrackedPlayer');

const router = express.Router();

router.use(requireAuth);

router.get('/trackedPlayers', async (req, res) => {
    const trackedPlayers = await TrackedPlayer.find({ userId: req.user._id });

    res.send(trackedPlayers);
});

router.post('/trackedPlayers', async (req, res) => {
    const { trackedPlayerId } = req.body;

    if (!trackedPlayerId) {
        return res.status(422).send({
            error: 'You must provide a tracked player ID.'
        });
    }

    const trackedPlayer = new TrackedPlayer({ trackedPlayerId, userId: req.user._id });

    try {
        await trackedPlayer.save();
        res.send(trackedPlayer);
    } catch (e) {
        res.status(422).send({
            error: e.message
        });
    }
});

router.delete('/trackedPlayers', async (req, res) => {
    const { trackedPlayerId } = req.body;

    if (!trackedPlayerId) {
        return res.status(422).send({
            error: 'You must provide a tracked player ID.'
        });
    }

    try {
        await TrackedPlayer.deleteOne({ trackedPlayerId });
        res.status(200).send('Successfully untracked player');
    } catch (e) {
        return res.status(422).send({
            error: 'Error untracking player.'
        });
    }
});

module.exports = router;
