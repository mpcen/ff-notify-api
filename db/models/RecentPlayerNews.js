const { model } = require('mongoose');
const RecentPlayerNewsSchema = require('../schemas/recentPlayerNewsSchema');
const RecentPlayerNews = model('RecentPlayerNews', RecentPlayerNewsSchema);

module.exports = RecentPlayerNews;