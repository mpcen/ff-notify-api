const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const childNodeSchema = new mongoose.Schema({
    contentType: String,
    data: String | null,
    text: Boolean,
    link: Boolean,
    username: Boolean
});

const recentPlayerNewsSchema = new mongoose.Schema({
    platform: String,
    username: String,
    contentId: String,
    player: {
        id: String,
        teamId: Number
    },
    content: String,
    time: Date,
    childNodes: [childNodeSchema]
});

recentPlayerNewsSchema.index({ contentId: 1, platform: 1, 'player.id': 1 }, { unique: true });
recentPlayerNewsSchema.index({ time: -1 });
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
