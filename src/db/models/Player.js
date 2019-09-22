const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    id: String,
    name: String,
    suffix: String,
    college: String,
    teamId: Number,
    position: String,
    number: String,
    avatarUrl: String
});

const Player = mongoose.model('Player', playerSchema);

module.exports = {
    Player,
    playerSchema
};