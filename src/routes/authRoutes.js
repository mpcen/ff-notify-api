const express = require('express');
const jwt = require('jsonwebtoken');

const User = require('../db/models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).send('You must enter a username and password');
    }

    try {
        const user = new User({ email, password });
        await user.save();

        const token = jwt.sign({ userId: user._id }, 'APP_SECRET');

        res.send({ token });
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

        res.send({ token });
    } catch (e) {
        return res.status(422).send({
            error: 'Invalid password or email'
        });
    }
});

module.exports = router;
