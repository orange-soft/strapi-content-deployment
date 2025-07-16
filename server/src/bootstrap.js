const { Server } = require('socket.io');

const bootstrap = ({ strapi }) => {
  // Initialize Socket.io
  process.nextTick(() => {
    const httpServer = strapi.server.httpServer;
    const io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // Store io instance in strapi for global access
    strapi.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected to deployment socket');

      socket.on('disconnect', () => {
        console.log('Client disconnected from deployment socket');
      });
    });

    console.log('Socket.io initialized for deployment plugin');
  });
};

export default bootstrap;
