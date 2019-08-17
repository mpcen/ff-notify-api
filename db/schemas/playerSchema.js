const { Schema } = require('mongoose');

const PlayerSchema = new Schema({
    id: String,
    name: String,
    suffix: String,
    college: String,
    teamId: Number,
    position: String,
    number: String,
    avatarUrl: String
});

module.exports = PlayerSchema;
