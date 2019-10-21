const jwt = require('jsonwebtoken');

const { User } = require('../db/models/User');
const APP_SECRET = process.env.APP_SECRET;

module.exports = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).send({ error: 'Unauthorized.' });
    }

    const token = authorization.replace('Bearer ', '');

    jwt.verify(token, APP_SECRET, async (error, payload) => {
        if (error) {
            return res.status(401).send({ error: 'You must be logged in.' });
        }

        const { userId } = payload;
        const user = await User.findById(userId);

        req.user = user;
        next();
    });
};
