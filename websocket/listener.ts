import * as io from 'socket.io-client';

const address = `http://localhost:${process.env.WEBSOCKET_PORT}`;
const socket = io(address);

console.log('Listening to socket running at:', address);

socket.on('alert', (newRecentPlayerNews: any) => {
    console.log('New News from Socket Client:', newRecentPlayerNews);
});
