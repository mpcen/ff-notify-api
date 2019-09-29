const express = require('express');

const requireAuth = require('../middlewares/requireAuth');
const { TrackedPlayer } = require('../db/models/TrackedPlayer');
const { TrackedPlayersOrder } = require('../db/models/TrackedPlayersOrder');
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

    const trackedPlayerDoc = new TrackedPlayer({ playerId, userId: req.user._id });
    const [playerModel] = await Player.find({ id: playerId });
    const [trackedPlayersOrderModel] = await TrackedPlayersOrder.find({ userId: req.user._id });

    if (!trackedPlayersOrderModel) {
        try {
            const trackedPlayersOrderDoc = new TrackedPlayersOrder({
                userId: req.user._id,
                trackedPlayersOrder: [playerId]
            });

            await trackedPlayersOrderDoc.save();
        } catch (e) {
            res.status(422).send({
                error: e.message
            });
        }
    } else {
        trackedPlayersOrderModel.trackedPlayersOrder.push(playerId);

        try {
            await trackedPlayersOrderModel.save();
        } catch (e) {
            return res.status(422).send({
                error: 'Error adding a new trackedPlayersOrder'
            });
        }
    }

    try {
        await trackedPlayerDoc.save();
        res.send(playerModel);
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
        const [untrackedPlayerModel] = await Player.find({ id: playerId });
        const [trackedPlayersOrderModel] = await TrackedPlayersOrder.find({ userId: req.user._id });
        const newtrackedPlayersOrder = trackedPlayersOrderModel.trackedPlayersOrder.filter(trackedPlayerId => {
            return trackedPlayerId !== playerId;
        });

        trackedPlayersOrderModel.trackedPlayersOrder = newtrackedPlayersOrder;

        await TrackedPlayer.deleteOne({ playerId });
        await trackedPlayersOrderModel.save();

        res.send(untrackedPlayerModel);
    } catch (e) {
        return res.status(422).send({
            error: 'Error untracking player.'
        });
    }
});

module.exports = router;
