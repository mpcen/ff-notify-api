require('dotenv').config();

const app = require('express')();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
});
mongoose.connection.on('err', console.error.bind(console, 'DB connection error:'));
mongoose.connection.once('open', () => console.log('Connected to DB:', process.env.NODE_ENV));

const requireAuth = require('./middlewares/requireAuth');

const authRoutes = require('./routes/authRoutes');
const playerServiceRoutes = require('./routes/playerServiceRoutes');
const recentPlayerNewsRoutes = require('./routes/recentPlayerNewsRoutes');

app.use(bodyParser.json({ limit: '999kb' }));
app.use(playerServiceRoutes);
app.use(authRoutes);
app.use(recentPlayerNewsRoutes);

app.get('/', requireAuth, (req, res) => {
    res.send(`You email is ${req.user.email}`);
});

app.listen(PORT, () => console.log(`API running on PORT: ${PORT}`));
