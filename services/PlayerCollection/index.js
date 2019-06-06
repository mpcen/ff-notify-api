const PlayerCollectionService = require('./PlayerCollectionService');

const options = {
    runTimes: 1,
    delay: 0
};

const playerCollectionService = new PlayerCollectionService();

(async () => {
    await playerCollectionService.run(options);
})();