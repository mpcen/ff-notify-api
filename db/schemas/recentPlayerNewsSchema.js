const { Schema } = require('mongoose');

const RecentPlayerNewsSchema = new Schema({
    platform: String,
    username: String,
    contentId: String,
    player: String,
    content: String
});

module.exports = RecentPlayerNewsSchema;