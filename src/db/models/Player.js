const { model } = require('mongoose');
const PlayerSchema = require('../schemas/playerSchema');
const Player = model('Player', PlayerSchema);

module.exports = Player;
