import { RecentNewsService } from './RecentNewsService';

(async () => {
    const options = {
        runTimes: 1,
        delay: 0
    };

    const recentNewsService = new RecentNewsService(options);

    try {
        await recentNewsService.run();
    } catch (e) {
        console.log('Error in RecentNews index:', e);
    }
})();
