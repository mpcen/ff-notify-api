const express = require('express');

const { UserPreferences } = require('../db/models/UserPreferences');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();
router.use(requireAuth);

// GET /userPreferences
// Returns all of the users preferences
router.get('/userPreferences', async (req, res) => {
    const userId = req.user._id;

    try {
        const userPreferencesDoc = await UserPreferences.findOne({ userId });

        res.send(userPreferencesDoc);
    } catch (e) {
        return res.status(422).send({
            error: 'Error getting user preferences'
        });
    }
});

// PUT /userPreferences
// This modifies any primitive userPreference value
router.put('/userPreferences', async (req, res) => {
    const userId = req.user._id;
    const userPreference = req.body;

    if (!userPreference) {
        return res.status(422).send({
            error: 'You must provide a user preference'
        });
    }

    try {
        const userPreferencesDoc = await UserPreferences.findOne({ userId });
        const key = Object.keys(userPreference)[0];
        const value = userPreference[key];

        userPreferencesDoc[key] = value;

        await userPreferencesDoc.save();

        res.send(userPreferencesDoc);
    } catch (e) {
        return res.status(422).send({
            error: 'Error updating user preferences'
        });
    }
});

module.exports = router;
