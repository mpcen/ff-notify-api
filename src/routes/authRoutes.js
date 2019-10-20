const express = require('express');
const jwt = require('jsonwebtoken');

const { APP_SECRET, API_URI } = process.env;
const { User } = require('../db/models/User');
const { UserPreferences } = require('../db/models/UserPreferences');
const { mailer } = require('../mailer/reset_password');
const router = express.Router();

// POST /signup
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).send('You must enter an email and password');
    }

    try {
        const user = new User({ email, password });
        const userId = user._id;
        const userPreferences = new UserPreferences({ userId });

        await user.save();
        await userPreferences.save();

        const token = jwt.sign({ userId: user._id }, APP_SECRET);

        res.send({ email, token });
    } catch (e) {
        console.log('e:', e);
        return res.status(422).send('Email already in use');
    }
});

// POST /signin
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).send('You must provide email and password');
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).send({ error: 'Invalid email or password' });
    }

    try {
        await user.comparePassword(password);

        const token = jwt.sign({ userId: user._id }, APP_SECRET);
        const email = user.email;

        res.send({ email, token });
    } catch (e) {
        return res.status(422).send({ error: 'Invalid email or password' });
    }
});

// POST /resetpassword
// Gets the email of the user and sends an email
// with a JWT'd url.
router.post('/resetpassword', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(422).send({
            error: 'You must provide an email'
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({
                error: 'Email does not exist'
            });
        }

        const token = jwt.sign({ userId: user._id }, user.password);
        const generatedUrl = `${API_URI}/resetpassword/${user._id}/${token}`;

        await mailer(email, generatedUrl);

        res.send(generatedUrl);
    } catch (e) {
        return res.status(422).send('Error resetting password');
    }
});

// POST /complete_password_reset
router.post('/resetpassword/:userId/:token', async (req, res) => {
    const { userId, token } = req.params;
    const { password } = req.body;

    if (!userId || !password || !token) {
        return res.status(422).send('You must enter a userId, password and token');
    }

    try {
        const user = await User.findById(userId);
        const secret = user.password;

        jwt.verify(token, secret, async (error, payload) => {
            if (error) {
                return res.status(401).send({ error: 'Error verifying password reset token' });
            }

            if (payload.userId == user._id) {
                user.password = password;

                await user.save();
                return res.send('Password has been reset');
            } else {
                return res.status(401).send({ error: 'Unauthorized password reset' });
            }
        });
    } catch (e) {
        return res.status(422).send('Error completing password reset');
    }
});

module.exports = router;
