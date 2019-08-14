const { Schema } = require('mongoose');

const PlayerSchema = new Schema({
    id: String,
    name: String,
    suffux: String,
    college: String,
    teamId: Number,
    position: String,
    number: String
});

const PlayersSchema = new Schema([PlayerSchema]);

module.exports = PlayersSchema;
