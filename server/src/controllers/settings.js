'use strict';

module.exports = ({ strapi }) => ({
  async getSettings(ctx) {
    try {
      const pluginStore = strapi.store({
        environment: strapi.config.environment,
        type: 'plugin',
        name: 'strapi-content-deployment',
      });

      const settings = await pluginStore.get({ key: 'settings' });
      
      ctx.body = {
        data: settings || {
          webhookUrl: '',
          vercelToken: '',
          projectId: '',
          teamId: '',
        },
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async updateSettings(ctx) {
    try {
      const { body } = ctx.request;
      console.log('Received settings update:', body);
      
      if (!body || !body.webhookUrl) {
        ctx.throw(400, 'Webhook URL is required');
      }

      const pluginStore = strapi.store({
        environment: strapi.config.environment,
        type: 'plugin',
        name: 'strapi-content-deployment',
      });

      await pluginStore.set({
        key: 'settings',
        value: {
          webhookUrl: body.webhookUrl,
          vercelToken: body.vercelToken || '',
          projectId: body.projectId || '',
          teamId: body.teamId || '',
          updatedAt: new Date().toISOString(),
        },
      });

      ctx.body = {
        data: {
          message: 'Settings updated successfully',
        },
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  },
});