const { Schema } = require('mongoose');

const TweetSchema = new Schema({
    time: String,
    content: String
});

const TwitterSchema = new Schema({
    name: String,
    username: String,
    verified: Boolean,
    tweets: [TweetSchema]
});

const RecentNewsSchema = new Schema({
    twitter: [TwitterSchema]
});

module.exports = RecentNewsSchema;