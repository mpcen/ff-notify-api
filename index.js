const startTime = Logger.time();
Logger.logHeader();

RecentPlayerNewsService(players, news);

if(typeof runTimes === 'number') runTimes--;

Logger.logRuntime('Run took', startTime);
Logger.logFooter();
await util_timeout(delay);