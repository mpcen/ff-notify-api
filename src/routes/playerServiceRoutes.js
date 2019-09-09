const express = require('express');

const router = express.Router();
const Player = require('../db/models/Player');


router.get('/players', async (req, res) => {
    try {
        const response = await Player.find();
        res.send(response);
    } catch (e) {
        console.log('Error from GET /players:', e);
        res.sendStatus(500);
    }
});

router.post('/players', async (req, res) => {
    try {
        const doc = await Player.insertMany(req.body);
        console.log('Stored new Player Data');
        res.send(doc);
    } catch (e) {
        console.log('Error from POST /players:', e.message);
        res.sendStatus(501);
    }
});

router.put('/players', async (req, res) => {
    const { action, players } = req.body;

    try {
        if (action === 'ADD') {
            const doc = await Player.insertMany(players);

            res.send(doc);
        } else if (action === 'UPDATE') {
            await Promise.all(players.map(({ id, teamId }) => Player.findOneAndUpdate({ id }, { teamId })));

            res.send(players);
        }
    } catch (e) {
        console.log('Error from PUT /players:', e.message);
        res.sendStatus(500);
    }
});

module.exports = router;