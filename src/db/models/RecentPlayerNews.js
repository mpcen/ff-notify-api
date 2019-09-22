const mongoose = require('mongoose');

const { playerSchema } = require('./Player');

const recentPlayerNewsSchema = new mongoose.Schema({
    platform: String,
    username: String,
    contentId: String,
    player: playerSchema,
    content: String,
    time: String
});

const RecentPlayerNews = mongoose.model('RecentPlayerNews', recentPlayerNewsSchema);

module.exports = { RecentPlayerNews };
