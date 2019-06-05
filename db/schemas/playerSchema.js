const { Schema } = require('mongoose');

const PlayerSchema = new Schema({
    name: String,
    suffux: String,
    college: String,
    teamId: Number,
    position: String,
    number: String
});

const PlayersSchema = new Schema({
    players: {
        type: [PlayerSchema]
    }
});

module.exports = PlayersSchema;