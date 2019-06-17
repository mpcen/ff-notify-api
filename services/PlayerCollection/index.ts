const { PlayerCollectionService } = require('./PlayerCollectionService');

(async () => {
    const options = {
        runTimes: 1,
        delay: 0
    };

    const playerCollectionService = new PlayerCollectionService(options);

    try {
        await playerCollectionService.run();
    } catch (e) {
        console.log('Error in player collection service:', e);
    }
})();
