const express = require('express');

const requireAuth = require('../middlewares/requireAuth');
const { UserPreferences } = require('../db/models/UserPreferences');

const router = express.Router();

router.use(requireAuth);

// PUT /trackedPlayers
// Updates UserPreferences.trackedPlayer
// most likely from resorting on the client
// Returns updated trackedPlayers list
router.put('/trackedplayers', async (req, res) => {
    const userId = req.user._id;
    const trackedPlayers = req.body;

    if (!trackedPlayers) {
        return res.status(422).send({ error: 'You must provide a list of tracked player ids' });
    }

    try {
        const userPreferencesDoc = await UserPreferences.findOne({ userId });
        userPreferencesDoc.trackedPlayers = trackedPlayers;

        await userPreferencesDoc.save();

        res.send(userPreferencesDoc);
    } catch (e) {
        res.status(422).send({ error: 'Error updating tracked players' });
    }
});

// POST /trackedPlayer
// Adds entry into UserPreferences.trackedPlayer
// Returns updated trackedPlayers list
router.post('/trackPlayer', async (req, res) => {
    const { playerId } = req.body;
    const userId = req.user._id;

    if (!playerId) {
        return res.status(422).send({
            error: 'You must provide a tracked player ID.'
        });
    }

    try {
        const userPreferencesDoc = await UserPreferences.findOne({ userId });

        userPreferencesDoc.trackedPlayers.push(playerId);

        await userPreferencesDoc.save();

        res.send(userPreferencesDoc);
    } catch (e) {
        res.status(422).send({
            error: 'Error tracking player: ' + e.message
        });
    }
});

// DELETE /trackedPlayer
// Deletes item from UserPreferences.trackedPlayer
// Returns updated trackedPlayers list
router.delete('/trackedPlayer', async (req, res) => {
    const { playerId } = req.body;
    const userId = req.user._id;

    if (!playerId) {
        return res.status(422).send({
            error: 'You must provide a tracked player ID.'
        });
    }

    try {
        const userPreferencesDoc = await UserPreferences.findOne({ userId });

        userPreferencesDoc.trackedPlayers = userPreferencesDoc.trackedPlayers.filter(
            _playerId => _playerId !== playerId
        );

        await userPreferencesDoc.save();

        res.send(userPreferencesDoc);
    } catch (e) {
        res.status(422).send({
            error: 'Error tracking player: ' + e.message
        });
    }
});

module.exports = router;
