const RecentNewsService = require('./RecentNewsService');

(async () => {
    const options = {
        runTimes: 1,
        delay: 0
    };
    
    const recentNewsService = new RecentNewsService(options);

    await recentNewsService.run();
})();