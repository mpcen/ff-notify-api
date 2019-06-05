const { model } = require('mongoose');
const PlayersSchema = require('../schemas/playerSchema');
const Players = model('Players', PlayersSchema);

module.exports = Players;