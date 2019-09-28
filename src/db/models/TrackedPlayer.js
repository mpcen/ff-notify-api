const mongoose = require('mongoose');

const trackedPlayerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    playerId: String
});

const TrackedPlayer = mongoose.model('TrackedPlayer', trackedPlayerSchema);

module.exports = { TrackedPlayer };
