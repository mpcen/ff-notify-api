import { PlayerCollectionService } from './PlayerCollectionService';

const options = {
    runTimes: 1,
    delay: 0
};
const playerCollectionService = new PlayerCollectionService(options);
playerCollectionService.run().catch(e => console.error('Error in player collection service:', e));
