const express = require('express');
const jwt = require('jsonwebtoken');

const { User } = require('../db/models/User');
const { UserPreferences } = require('../db/models/UserPreferences');
const router = express.Router();

router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).send('You must enter a username and password');
    }

    try {
        const user = new User({ email, password });
        const userId = user._id;
        const userPreferences = new UserPreferences({ userId });

        await user.save();
        await userPreferences.save();

        const token = jwt.sign({ userId: user._id }, 'APP_SECRET');

        res.send({ email, token });
    } catch (e) {
        return res.status(422).send('Email already in use');
    }
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).send({
            error: 'You must provide email and password'
        });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).send({
            error: 'Invalid password or email'
        });
    }

    try {
        await user.comparePassword(password);

        const token = jwt.sign({ userId: user._id }, 'APP_SECRET');
        const email = user.email;

        res.send({ email, token });
    } catch (e) {
        return res.status(422).send({
            error: 'Invalid password or email'
        });
    }
});

module.exports = router;
