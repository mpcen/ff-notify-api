const express = require('express');

const requireAuth = require('../middlewares/requireAuth');
const { TrackedPlayersOrder } = require('../db/models/TrackedPlayersOrder');
const { Player } = require('../db/models/Player');

const router = express.Router();

router.use(requireAuth);

router.put('/trackedPlayersOrder', async (req, res) => {
    const userId = req.user._id;
    const { trackedPlayersOrder } = req.body;

    if (!trackedPlayersOrder) {
        return res.status(422).send({ error: 'You must provide a list of tracked player ids' });
    }

    try {
        const trackedPlayersOrderModel = await TrackedPlayersOrder.findOne({ userId });

        trackedPlayersOrderModel.trackedPlayersOrder = trackedPlayersOrder;

        await trackedPlayersOrderModel.save();

        res.send(trackedPlayersOrderModel);
    } catch (e) {
        res.status(422).send({ error: 'Error updating tracked players order' });
    }
});

module.exports = router;
