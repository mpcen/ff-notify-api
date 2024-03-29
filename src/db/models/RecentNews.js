const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
    id: String,
    time: Date,
    content: String
});

const twitterUserSchema = new mongoose.Schema({
    name: String,
    platform: { type: String, default: 'twitter' },
    username: String,
    verified: Boolean,
    tweets: [tweetSchema],
    lastActivityTime: Date
});

const recentNewsSchema = new mongoose.Schema({
    name: String,
    recentNews: [twitterUserSchema]
});

const RecentNews = mongoose.model('RecentNews', recentNewsSchema);

module.exports = {
    RecentNews
};
