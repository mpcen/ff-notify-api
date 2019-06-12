const io = require('socket.io-client');

const address = 'http://localhost:5001';
const socket = io(address);

console.log('Listening to socket:', address)

socket.on('alert', newRecentPlayerNews => {
    console.log('New News from Socket Client:', newRecentPlayerNews);
});