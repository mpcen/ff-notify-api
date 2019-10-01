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

TrackedPlayer.on('index', function(err) {
    if (err) {
        console.error('TrackedPlayer index error: %s', err);
    } else {
        console.info('TrackedPlayer indexing complete');
    }
});

module.exports = { TrackedPlayer };
