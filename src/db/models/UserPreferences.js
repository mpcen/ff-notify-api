const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    },
    trackedPlayers: {
        type: [String],
        default: []
    },
    timelineSortType: {
        type: Number,
        default: 0
    }
});

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

UserPreferences.on('index', function(err) {
    if (err) {
        console.error('UserPreferences index error: %s', err);
    } else {
        console.info('UserPreferences indexing complete');
    }
});

module.exports = { UserPreferences };
