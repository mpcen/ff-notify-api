const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const { playerSchema } = require('./Player');

const recentPlayerNewsSchema = new mongoose.Schema({
    platform: String,
    username: String,
    contentId: String,
    player: playerSchema,
    content: String,
    time: Date
});

recentPlayerNewsSchema.index({ 'player.id': 1, time: -1 });
recentPlayerNewsSchema.plugin(mongoosePaginate);

const RecentPlayerNews = mongoose.model('RecentPlayerNews', recentPlayerNewsSchema);

RecentPlayerNews.on('index', function(err) {
    if (err) {
        console.error('RecentPlayerNews index error: %s', err);
    } else {
        console.info('RecentPlayerNews indexing complete');
    }
});

module.exports = { RecentPlayerNews };
