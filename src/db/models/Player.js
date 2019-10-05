const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true
    },
    name: String,
    suffix: String,
    college: String,
    teamId: Number,
    position: String,
    number: String,
    avatarUrl: String
});

const Player = mongoose.model('Player', playerSchema);

Player.on('index', function(err) {
    if (err) {
        console.error('Player index error: %s', err);
    } else {
        console.info('Player indexing complete');
    }
});

module.exports = {
    Player,
    playerSchema
};
