const { Schema } = require('mongoose');

const TweetSchema = new Schema({
    id: String,
    time: String,
    content: String
});

const TwitterUserSchema = new Schema({
    name: String,
    platform: { type: String, default: 'twitter' },
    username: String,
    verified: Boolean,
    tweets: [TweetSchema],
    lastActivityTime: String
});

const RecentNewsSchema = new Schema({
    name: String,
    recentNews: [TwitterUserSchema]
});

module.exports = RecentNewsSchema;
