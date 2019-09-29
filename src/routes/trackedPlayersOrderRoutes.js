const express = require('express');

const requireAuth = require('../middlewares/requireAuth');
const { TrackedPlayersOrder } = require('../db/models/TrackedPlayersOrder');
const { Player } = require('../db/models/Player');

const router = express.Router();

router.use(requireAuth);

router.get('/trackedPlayersOrder', async (req, res) => {
    try {
        const [trackedPlayersOrderModel] = await TrackedPlayersOrder.find({ userId: req.user._id });

        if (!trackedPlayersOrderModel) {
            return res.send([]);
        }

        res.send(trackedPlayersOrderModel);
    } catch (e) {
        res.status(422).send({ error: 'Error fetching tracked players order' });
    }
});

router.put('/trackedPlayersOrder', async (req, res) => {
    try {
        const [trackedPlayersOrderModel] = await TrackedPlayersOrder.find({ userId: req.user._id });
        const newtrackedPlayersOrder = req.body.trackedPlayersOrder;

        trackedPlayersOrderModel.trackedPlayersOrder = newtrackedPlayersOrder.map(trackedPlayer => trackedPlayer.id);
        await trackedPlayersOrderModel.save();

        const orderedTrackedPlayers = await Promise.all(
            trackedPlayersOrderModel.trackedPlayersOrder.map(async orderedTrackedPlayerId => {
                const [trackedPlayer] = await Player.find({ id: orderedTrackedPlayerId });

                return trackedPlayer;
            })
        );

        res.send(orderedTrackedPlayers);
    } catch (e) {
        res.status(422).send({ error: 'Error updating tracked players order' });
    }
});

module.exports = router;
