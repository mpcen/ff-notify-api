require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const requireAuth = require('./middlewares/requireAuth');
const authRoutes = require('./routes/authRoutes');
const playerServiceRoutes = require('./routes/playerServiceRoutes');
const recentPlayerNewsRoutes = require('./routes/recentPlayerNewsRoutes');
const trackedPlayerRoutes = require('./routes/trackedPlayerRoutes');
const userPreferencesRoutes = require('./routes/userPreferencesRoutes');

app.use(bodyParser.json({ limit: '999kb' }));
app.use(authRoutes);
app.use(playerServiceRoutes);
app.use(recentPlayerNewsRoutes);
app.use(trackedPlayerRoutes);
app.use(userPreferencesRoutes);

mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
});
mongoose.connection.on('err', console.error.bind(console, 'DB connection error:'));
mongoose.connection.once('open', () => console.log('Connected to DB:', process.env.NODE_ENV));

app.get('/', requireAuth, (req, res) => {
    res.send(`You email is ${req.user.email}`);
});

app.listen(PORT, () => console.log(`API running on PORT: ${PORT}`));
