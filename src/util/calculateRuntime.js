'use strict';

const calculateRuntime = startTime => {
    const runtime = Date.now() - startTime;
    console.log('Process took:', runtime + 'ms');
};

module.exports = calculateRuntime;
