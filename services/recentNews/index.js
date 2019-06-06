const RecentNewsService = require('./RecentNewsService');

const options = {
    runTimes: 1,
    delay: 0
};

const recentNewsService = new RecentNewsService();

(async () => {
    await recentNewsService.run(options);
})();