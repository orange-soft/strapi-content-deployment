'use strict';

module.exports = {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/settings',
      handler: 'settings.getSettings',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/settings',
      handler: 'settings.updateSettings',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/deploy',
      handler: 'deployment.triggerDeployment',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/deployment/status',
      handler: 'deployment.getDeploymentStatus',
      config: {
        policies: [],
      },
    },
  ],
};