const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const badwords = require('bad-words');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('../src/utils/users');
const {
  generateMessage,
  generateLocationMessage
} = require('../src/utils/message');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('', (req, res, next) => {
  res.render('index.html');
});

io.on('connection', socket => {
  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit('message', generateMessage('Admin', 'Welcome!!'));
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage('Admin:', `${user.username} has joined!!'`)
      );
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
    callback();
  });
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    const filter = new badwords();
    if (filter.isProfane(message)) {
      return callback("Can't Send this message contains profancy words");
    }
    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback();
  });
  socket.on('shareLocation', (position, cb) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${position.latitude},${position.longitude}`
      )
    );
    cb('Location Shared');
  });
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage('Admin:', `${user.username} has left!!`)
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => {
  console.log('sever started at port' + port);
});
