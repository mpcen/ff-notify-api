const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

const emitter = require('../Emitter');
const PORT = process.env.PORT || 5001;

app.use(bodyParser.json());

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

http.listen(PORT, () => {
  console.log('Socket running on port:', PORT);
});

module.exports = emitter;