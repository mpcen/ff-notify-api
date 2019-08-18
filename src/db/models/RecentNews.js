const { model } = require('mongoose');
const RecentNewsSchema = require('../schemas/recentNewsSchema');
const RecentNews = model('RecentNews', RecentNewsSchema);

module.exports = RecentNews;