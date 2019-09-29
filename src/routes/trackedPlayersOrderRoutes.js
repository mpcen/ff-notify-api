const express = require('express');

const requireAuth = require('../middlewares/requireAuth');
const { TrackedPlayersOrder } = require('../db/models/TrackedPlayersOrder');

const router = express.Router();

router.use(requireAuth);

router.get('/trackedPlayersOrder', async (req, res) => {
    try {
        const [trackedPlayersOrderModel] = await TrackedPlayersOrder.find({ userId: req.user._id });

        res.send(trackedPlayersOrderModel);
    } catch (e) {
        res.status(422).send({ error: 'Error fetching tracked players order' });
    }
});

router.put('/trackedPlayersOrder', async (req, res) => {
    try {
        const [trackedPlayersOrderModel] = await TrackedPlayersOrder.find({ userId: req.user._id });
        const newtrackedPlayersOrder = req.body.trackedPlayersOrder;

        trackedPlayersOrderModel.trackedPlayersOrder = newtrackedPlayersOrder;
        await trackedPlayersOrderModel.save();

        res.send(newtrackedPlayersOrder);
    } catch (e) {
        res.status(422).send({ error: 'Error updating tracked players order' });
    }
});

module.exports = router;
