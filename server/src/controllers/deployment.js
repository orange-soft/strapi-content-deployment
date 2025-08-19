'use strict';

const axios = require('axios');

module.exports = ({ strapi }) => ({
  deploymentState: {
    isDeploying: false,
    currentDeployment: null,
    logs: [],
  },

  async triggerDeployment(ctx) {
    console.log('=== DEPLOYMENT TRIGGER CALLED ===');
    try {
      if (this.deploymentState.isDeploying) {
        ctx.throw(400, 'A deployment is already in progress');
      }

      const pluginStore = strapi.store({
        environment: strapi.config.environment,
        type: 'plugin',
        name: 'strapi-content-deployment',
      });

      const settings = await pluginStore.get({ key: 'settings' });

      if (!settings || !settings.webhookUrl) {
        ctx.throw(400, 'Webhook URL not configured. Please configure it in settings.');
      }

      this.deploymentState.isDeploying = true;
      this.deploymentState.logs = [];
      this.deploymentState.currentDeployment = {
        id: Date.now().toString(),
        startedAt: new Date().toISOString(),
        status: 'pending',
      };

      // Emit deployment started event
      if (strapi.io) {
        strapi.io.emit('deployment:started', this.deploymentState.currentDeployment);
      }

      // Trigger the Vercel deployment webhook
      const response = await axios.post(settings.webhookUrl, {
        trigger: 'strapi-content-deployment',
        timestamp: new Date().toISOString(),
      });

      console.log('Vercel webhook response:', JSON.stringify(response.data, null, 2));

      // Try different response formats
      let deploymentId = null;
      let deploymentUrl = null;

      // Check various possible response structures
      if (response.data) {
        if (response.data.job) {
          deploymentId = response.data.job.id;
          deploymentUrl = response.data.job.url;
        } else if (response.data.id) {
          deploymentId = response.data.id;
          deploymentUrl = response.data.url;
        } else if (response.data.deploymentId) {
          deploymentId = response.data.deploymentId;
          deploymentUrl = response.data.deploymentUrl;
        }
      }

      if (deploymentId) {
        this.deploymentState.currentDeployment.vercelId = deploymentId;
        this.deploymentState.currentDeployment.vercelUrl = deploymentUrl;
        console.log('Captured deployment ID:', deploymentId);
      } else {
        console.log('No deployment ID found in webhook response');
      }

      // Start polling for deployment status if we have ALL requirements
      if (settings.vercelToken && settings.projectId && deploymentId) {
        console.log('Starting deployment status polling...');
        this.pollDeploymentStatus(settings.vercelToken, settings.projectId, deploymentId, settings.teamId);
      } else {
        // Log what's missing
        if (!deploymentId) {
          console.log('Cannot poll status: No deployment ID from webhook response');
        }
        if (!settings.vercelToken) {
          console.log('Cannot poll status: No Vercel token configured');
        }
        if (!settings.projectId) {
          console.log('Cannot poll status: No project ID configured');
        }

        // If no polling available, simulate completion after a delay
        console.log('Using simple mode - will complete after 5 seconds');
        setTimeout(() => {
          this.deploymentState.isDeploying = false;
          this.deploymentState.currentDeployment.status = 'completed';
          this.deploymentState.currentDeployment.completedAt = new Date().toISOString();

          if (strapi.io) {
            strapi.io.emit('deployment:completed', this.deploymentState.currentDeployment);
          }
        }, 5000);
      }

      ctx.body = {
        data: {
          message: 'Deployment triggered successfully',
          deployment: this.deploymentState.currentDeployment,
        },
      };
    } catch (error) {
      this.deploymentState.isDeploying = false;
      this.deploymentState.currentDeployment = null;

      if (strapi.io) {
        strapi.io.emit('deployment:failed', { error: error.message });
      }

      ctx.throw(500, error);
    }
  },

  async getDeploymentStatus(ctx) {
    ctx.body = {
      data: {
        isDeploying: this.deploymentState.isDeploying,
        currentDeployment: this.deploymentState.currentDeployment,
        logs: this.deploymentState.logs,
      },
    };
  },

  async pollDeploymentStatus(token, projectId, deploymentId, teamId) {
    console.log('Polling deployment status with:', { projectId, deploymentId, teamId });
    try {
      const checkStatus = async () => {
        try {
          // Ensure token has Bearer prefix for Vercel API
          const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

          // Get the latest deployment for this project
          const teamParam = teamId ? `&teamId=${teamId}` : '';
          console.log(`Fetching deployments from: https://api.vercel.com/v6/deployments?projectId=${projectId}${teamParam}&limit=1`);
          const deploymentsResponse = await axios.get(
            `https://api.vercel.com/v6/deployments?projectId=${projectId}${teamParam}&limit=1`,
            {
              headers: {
                Authorization: authToken,
              },
            }
          );

          if (!deploymentsResponse.data.deployments || deploymentsResponse.data.deployments.length === 0) {
            throw new Error('No deployments found');
          }

          const deployment = deploymentsResponse.data.deployments[0];
          this.deploymentState.currentDeployment.status = deployment.state || deployment.readyState;

          // Update deployment URL
          if (deployment.url) {
            this.deploymentState.currentDeployment.vercelUrl = `https://${deployment.url}`;
          }

          // Add log entry
          const logEntry = {
            timestamp: new Date().toISOString(),
            message: `Deployment status: ${deployment.state || deployment.readyState}`,
            type: 'info',
          };
          this.deploymentState.logs.push(logEntry);

          if (strapi.io) {
            strapi.io.emit('deployment:status', {
              deployment: this.deploymentState.currentDeployment,
              logs: this.deploymentState.logs,
            });
          }

          // Check if deployment is complete (v6 API uses 'readyState')
          const status = deployment.readyState || deployment.state;
          if (status === 'READY' || status === 'ERROR' || status === 'CANCELED') {
            this.deploymentState.isDeploying = false;
            this.deploymentState.currentDeployment.completedAt = new Date().toISOString();

            if (strapi.io) {
              strapi.io.emit('deployment:completed', this.deploymentState.currentDeployment);
            }

            return; // Stop polling
          }

          // Continue polling
          setTimeout(checkStatus, 3000);
        } catch (error) {
          console.error('Error polling deployment status:', error.response?.data || error.message);

          // If it's a 404, the project ID or token might be wrong
          // Instead of failing, just complete the deployment after showing a warning
          if (error.response?.status === 404) {
            console.log('Project not found. Completing deployment without real-time tracking.');

            this.deploymentState.isDeploying = false;
            this.deploymentState.currentDeployment.status = 'completed';
            this.deploymentState.currentDeployment.completedAt = new Date().toISOString();

            // Add a warning log
            const warningLog = {
              timestamp: new Date().toISOString(),
              message: 'Could not track deployment status. Check your Vercel token and project ID.',
              type: 'warning',
            };
            this.deploymentState.logs.push(warningLog);

            if (strapi.io) {
              strapi.io.emit('deployment:completed', this.deploymentState.currentDeployment);
            }
          } else {
            // For other errors, fail the deployment
            this.deploymentState.isDeploying = false;

            if (strapi.io) {
              strapi.io.emit('deployment:failed', { error: error.message });
            }
          }
        }
      };

      // Start polling
      setTimeout(checkStatus, 2000);
    } catch (error) {
      console.error('Error in pollDeploymentStatus:', error);
    }
  },
});
