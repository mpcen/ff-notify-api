import * as express from 'express';
import { Server } from 'http';
import * as SocketIO from 'socket.io'; // Need to figure this warning out
import { EventEmitter } from 'events';

const app = express();
const server = new Server(app);
const io = SocketIO(server);
const PORT = process.env.PORT || 5001;
export const emitter = new EventEmitter();

emitter.on('alert', newRecentPlayerNews => {
    io.emit('alert', newRecentPlayerNews);
});

io.on('connection', socket => {
    console.log('Connected to Socket');

    socket.on('alert', newRecentPlayerNews => {
        console.log('New News from Socket Server:', newRecentPlayerNews);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(PORT, () => {
    console.log('Socket running on port:', PORT);
});
