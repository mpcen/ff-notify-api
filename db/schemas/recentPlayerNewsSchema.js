const { Schema } = require('mongoose');
const { PlayerSchema } = require('./playerSchema');

const RecentPlayerNewsSchema = new Schema({
    platform: String,
    username: String,
    contentId: String,
    player: PlayerSchema,
    content: String,
    time: String
});

module.exports = RecentPlayerNewsSchema;
