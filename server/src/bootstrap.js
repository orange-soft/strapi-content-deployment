const { Server } = require('socket.io');

const bootstrap = async ({ strapi }) => {
  // Register permissions
  const actions = [
    {
      section: 'plugins',
      displayName: 'Access the deployment plugin',
      uid: 'read',
      pluginName: 'strapi-content-deployment',
    },
    {
      section: 'plugins',
      displayName: 'Read deployment settings',
      uid: 'settings.read',
      pluginName: 'strapi-content-deployment',
    },
    {
      section: 'plugins',
      displayName: 'Update deployment settings',
      uid: 'settings.update',
      pluginName: 'strapi-content-deployment',
    },
    {
      section: 'plugins',
      displayName: 'Trigger deployments',
      uid: 'deploy',
      pluginName: 'strapi-content-deployment',
    },
    {
      section: 'plugins',
      displayName: 'View deployment status',
      uid: 'deployment.status',
      pluginName: 'strapi-content-deployment',
    },
  ];

  await strapi.service('admin::permission').actionProvider.registerMany(actions);

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
