const mongoose = require('mongoose');

const trackedPlayersOrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    trackedPlayersOrder: [String]
});

const TrackedPlayersOrder = mongoose.model('TrackedPlayersOrder', trackedPlayersOrderSchema);

module.exports = { TrackedPlayersOrder };
