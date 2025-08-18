import require$$0 from "axios";
const { Server } = require("socket.io");
const bootstrap = async ({ strapi }) => {
  const actions = [
    {
      section: "plugins",
      displayName: "Access the deployment plugin",
      uid: "read",
      pluginName: "strapi-content-deployment"
    },
    {
      section: "plugins",
      displayName: "Read deployment settings",
      uid: "settings.read",
      pluginName: "strapi-content-deployment"
    },
    {
      section: "plugins",
      displayName: "Update deployment settings",
      uid: "settings.update",
      pluginName: "strapi-content-deployment"
    },
    {
      section: "plugins",
      displayName: "Trigger deployments",
      uid: "deploy",
      pluginName: "strapi-content-deployment"
    },
    {
      section: "plugins",
      displayName: "View deployment status",
      uid: "deployment.status",
      pluginName: "strapi-content-deployment"
    }
  ];
  await strapi.service("admin::permission").actionProvider.registerMany(actions);
  process.nextTick(() => {
    const httpServer = strapi.server.httpServer;
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    strapi.io = io;
    io.on("connection", (socket) => {
      console.log("Client connected to deployment socket");
      socket.on("disconnect", () => {
        console.log("Client disconnected from deployment socket");
      });
    });
    console.log("Socket.io initialized for deployment plugin");
  });
};
const destroy = ({ strapi }) => {
};
const register = ({ strapi }) => {
};
const config = {
  default: {},
  validator() {
  }
};
const contentTypes = {};
const controller = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi.plugin("strapi-content-deployment").service("service").getWelcomeMessage();
  }
});
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var settings = ({ strapi }) => ({
  async getSettings(ctx) {
    try {
      const pluginStore = strapi.store({
        environment: strapi.config.environment,
        type: "plugin",
        name: "strapi-content-deployment"
      });
      const settings2 = await pluginStore.get({ key: "settings" });
      ctx.body = {
        data: settings2 || {
          webhookUrl: "",
          vercelToken: "",
          projectId: ""
        }
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  async updateSettings(ctx) {
    try {
      const { body } = ctx.request;
      if (!body || !body.webhookUrl) {
        ctx.throw(400, "Webhook URL is required");
      }
      const pluginStore = strapi.store({
        environment: strapi.config.environment,
        type: "plugin",
        name: "strapi-content-deployment"
      });
      await pluginStore.set({
        key: "settings",
        value: {
          webhookUrl: body.webhookUrl,
          vercelToken: body.vercelToken || "",
          projectId: body.projectId || "",
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      ctx.body = {
        data: {
          message: "Settings updated successfully"
        }
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  }
});
const settings$1 = /* @__PURE__ */ getDefaultExportFromCjs(settings);
const axios = require$$0;
var deployment = ({ strapi }) => ({
  deploymentState: {
    isDeploying: false,
    currentDeployment: null,
    logs: []
  },
  async triggerDeployment(ctx) {
    console.log("=== DEPLOYMENT TRIGGER CALLED ===");
    try {
      if (this.deploymentState.isDeploying) {
        ctx.throw(400, "A deployment is already in progress");
      }
      const pluginStore = strapi.store({
        environment: strapi.config.environment,
        type: "plugin",
        name: "strapi-content-deployment"
      });
      const settings2 = await pluginStore.get({ key: "settings" });
      if (!settings2 || !settings2.webhookUrl) {
        ctx.throw(400, "Webhook URL not configured. Please configure it in settings.");
      }
      this.deploymentState.isDeploying = true;
      this.deploymentState.logs = [];
      this.deploymentState.currentDeployment = {
        id: Date.now().toString(),
        startedAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "pending"
      };
      if (strapi.io) {
        strapi.io.emit("deployment:started", this.deploymentState.currentDeployment);
      }
      const response = await axios.post(settings2.webhookUrl, {
        trigger: "strapi-content-deployment",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      console.log("Vercel webhook response:", JSON.stringify(response.data, null, 2));
      let deploymentId = null;
      let deploymentUrl = null;
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
        console.log("Captured deployment ID:", deploymentId);
      } else {
        console.log("No deployment ID found in webhook response");
      }
      if (settings2.vercelToken && settings2.projectId && deploymentId) {
        console.log("Starting deployment status polling...");
        this.pollDeploymentStatus(settings2.vercelToken, settings2.projectId, deploymentId);
      } else {
        if (!deploymentId) {
          console.log("Cannot poll status: No deployment ID from webhook response");
        }
        if (!settings2.vercelToken) {
          console.log("Cannot poll status: No Vercel token configured");
        }
        if (!settings2.projectId) {
          console.log("Cannot poll status: No project ID configured");
        }
        console.log("Using simple mode - will complete after 5 seconds");
        setTimeout(() => {
          this.deploymentState.isDeploying = false;
          this.deploymentState.currentDeployment.status = "completed";
          this.deploymentState.currentDeployment.completedAt = (/* @__PURE__ */ new Date()).toISOString();
          if (strapi.io) {
            strapi.io.emit("deployment:completed", this.deploymentState.currentDeployment);
          }
        }, 5e3);
      }
      ctx.body = {
        data: {
          message: "Deployment triggered successfully",
          deployment: this.deploymentState.currentDeployment
        }
      };
    } catch (error) {
      this.deploymentState.isDeploying = false;
      this.deploymentState.currentDeployment = null;
      if (strapi.io) {
        strapi.io.emit("deployment:failed", { error: error.message });
      }
      ctx.throw(500, error);
    }
  },
  async getDeploymentStatus(ctx) {
    ctx.body = {
      data: {
        isDeploying: this.deploymentState.isDeploying,
        currentDeployment: this.deploymentState.currentDeployment,
        logs: this.deploymentState.logs
      }
    };
  },
  async pollDeploymentStatus(token, projectId, deploymentId) {
    console.log("Polling deployment status with:", { projectId, deploymentId });
    try {
      const checkStatus = async () => {
        try {
          const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
          console.log(`Fetching deployments from: https://api.vercel.com/v9/projects/${projectId}/deployments?limit=1`);
          const deploymentsResponse = await axios.get(
            `https://api.vercel.com/v9/projects/${projectId}/deployments?limit=1`,
            {
              headers: {
                Authorization: authToken
              }
            }
          );
          if (!deploymentsResponse.data.deployments || deploymentsResponse.data.deployments.length === 0) {
            throw new Error("No deployments found");
          }
          const deployment2 = deploymentsResponse.data.deployments[0];
          this.deploymentState.currentDeployment.status = deployment2.state || deployment2.readyState;
          if (deployment2.url) {
            this.deploymentState.currentDeployment.vercelUrl = `https://${deployment2.url}`;
          }
          const logEntry = {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            message: `Deployment status: ${deployment2.state || deployment2.readyState}`,
            type: "info"
          };
          this.deploymentState.logs.push(logEntry);
          if (strapi.io) {
            strapi.io.emit("deployment:status", {
              deployment: this.deploymentState.currentDeployment,
              logs: this.deploymentState.logs
            });
          }
          const status = deployment2.state || deployment2.readyState;
          if (status === "READY" || status === "ERROR" || status === "CANCELED") {
            this.deploymentState.isDeploying = false;
            this.deploymentState.currentDeployment.completedAt = (/* @__PURE__ */ new Date()).toISOString();
            if (strapi.io) {
              strapi.io.emit("deployment:completed", this.deploymentState.currentDeployment);
            }
            return;
          }
          setTimeout(checkStatus, 3e3);
        } catch (error) {
          console.error("Error polling deployment status:", error.response?.data || error.message);
          if (error.response?.status === 404) {
            console.log("Project not found. Completing deployment without real-time tracking.");
            this.deploymentState.isDeploying = false;
            this.deploymentState.currentDeployment.status = "completed";
            this.deploymentState.currentDeployment.completedAt = (/* @__PURE__ */ new Date()).toISOString();
            const warningLog = {
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              message: "Could not track deployment status. Check your Vercel token and project ID.",
              type: "warning"
            };
            this.deploymentState.logs.push(warningLog);
            if (strapi.io) {
              strapi.io.emit("deployment:completed", this.deploymentState.currentDeployment);
            }
          } else {
            this.deploymentState.isDeploying = false;
            if (strapi.io) {
              strapi.io.emit("deployment:failed", { error: error.message });
            }
          }
        }
      };
      setTimeout(checkStatus, 2e3);
    } catch (error) {
      console.error("Error in pollDeploymentStatus:", error);
    }
  }
});
const deployment$1 = /* @__PURE__ */ getDefaultExportFromCjs(deployment);
const controllers = {
  controller,
  settings: settings$1,
  deployment: deployment$1
};
const middlewares = {};
const policies = {};
const contentAPIRoutes = [
  {
    method: "GET",
    path: "/",
    // name of the controller file & the method.
    handler: "controller.index",
    config: {
      policies: []
    }
  }
];
var admin = {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/settings",
      handler: "settings.getSettings",
      config: {
        policies: []
      }
    },
    {
      method: "PUT",
      path: "/settings",
      handler: "settings.updateSettings",
      config: {
        policies: []
      }
    },
    {
      method: "POST",
      path: "/deploy",
      handler: "deployment.triggerDeployment",
      config: {
        policies: []
      }
    },
    {
      method: "GET",
      path: "/deployment/status",
      handler: "deployment.getDeploymentStatus",
      config: {
        policies: []
      }
    }
  ]
};
const adminRoutes = /* @__PURE__ */ getDefaultExportFromCjs(admin);
const routes = {
  "content-api": {
    type: "content-api",
    routes: contentAPIRoutes
  },
  admin: adminRoutes
};
const service = ({ strapi }) => ({
  getWelcomeMessage() {
    return "Welcome to Strapi 🚀";
  }
});
const services = {
  service
};
const index = {
  bootstrap,
  destroy,
  register,
  config,
  controllers,
  contentTypes,
  middlewares,
  policies,
  routes,
  services
};
export {
  index as default
};
