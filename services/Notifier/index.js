const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

const emitter = require('../Emitter');
const PORT = process.env.PORT || 5001;

app.use(bodyParser.json());

emitter.on('test1', () => {
  io.emit('test1');
});

io.on('connection', socket => {
  console.log('Connected to Socket');

  socket.on('test1', () => {
    console.log('test1 fired in socket');
  }); 

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(PORT, () => {
  console.log('Socket running on port:', PORT);
});

module.exports = emitter;