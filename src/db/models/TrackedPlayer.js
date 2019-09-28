const mongoose = require('mongoose');

const trackedPlayerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    playerId: String
});

trackedPlayerSchema.index({ userId: 1, playerId: 1 }, { unique: true });

const TrackedPlayer = mongoose.model('TrackedPlayer', trackedPlayerSchema);

module.exports = { TrackedPlayer };
