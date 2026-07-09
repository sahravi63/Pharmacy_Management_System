const { Server } = require('socket.io');
const { setNotificationSocket } = require('./notificationService');

const initializeSocket = (server, corsOrigin) => {
  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.join('notifications');

    socket.on('notifications:join', () => {
      socket.join('notifications');
    });
  });

  setNotificationSocket(io);
  return io;
};

module.exports = initializeSocket;
