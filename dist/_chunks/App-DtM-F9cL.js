"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const admin = require("@strapi/strapi/admin");
const reactRouterDom = require("react-router-dom");
const designSystem = require("@strapi/design-system");
const reactIntl = require("react-intl");
const react = require("react");
const io = require("socket.io-client");
const icons = require("@strapi/icons");
const Settings = require("./Settings-13yDaLQZ.js");
const _interopDefault = (e) => e && e.__esModule ? e : { default: e };
const io__default = /* @__PURE__ */ _interopDefault(io);
const Deployment = () => {
  const { formatMessage } = reactIntl.useIntl();
  const { get, post } = admin.useFetchClient();
  const [isDeploying, setIsDeploying] = react.useState(false);
  const [deploymentStatus, setDeploymentStatus] = react.useState(null);
  const [logs, setLogs] = react.useState([]);
  const [notification, setNotification] = react.useState(null);
  const [socket, setSocket] = react.useState(null);
  const [hasWebhook, setHasWebhook] = react.useState(true);
  react.useEffect(() => {
    checkWebhookConfiguration();
    const newSocket = io__default.default(window.location.origin);
    setSocket(newSocket);
    newSocket.on("deployment:started", (deployment) => {
      setIsDeploying(true);
      setDeploymentStatus(deployment);
      setLogs([]);
    });
    newSocket.on("deployment:status", ({ deployment, logs: newLogs }) => {
      setDeploymentStatus(deployment);
      setLogs(newLogs);
    });
    newSocket.on("deployment:completed", (deployment) => {
      setIsDeploying(false);
      setDeploymentStatus(deployment);
      setNotification({
        type: "success",
        message: "Deployment completed successfully!"
      });
    });
    newSocket.on("deployment:failed", ({ error }) => {
      setIsDeploying(false);
      setNotification({
        type: "danger",
        message: `Deployment failed: ${error}`
      });
    });
    fetchDeploymentStatus();
    return () => {
      newSocket.disconnect();
    };
  }, []);
  const checkWebhookConfiguration = async () => {
    try {
      const { data } = await get("/strapi-content-deployment/settings");
      setHasWebhook(!!data.data?.webhookUrl);
    } catch (error) {
      console.error("Error checking webhook configuration:", error);
    }
  };
  const fetchDeploymentStatus = async () => {
    try {
      const { data } = await get("/strapi-content-deployment/deployment/status");
      setIsDeploying(data.data.isDeploying);
      setDeploymentStatus(data.data.currentDeployment);
      setLogs(data.data.logs || []);
    } catch (error) {
      console.error("Error fetching deployment status:", error);
    }
  };
  const handleDeploy = async () => {
    setNotification(null);
    try {
      const { data } = await post("/strapi-content-deployment/deploy");
      setNotification({
        type: "success",
        message: data.data.message
      });
    } catch (error) {
      console.error("Error triggering deployment:", error);
      setNotification({
        type: "danger",
        message: error.response?.data?.error?.message || "Failed to trigger deployment"
      });
    }
  };
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: "warning", label: "Pending" },
      building: { color: "primary", label: "Building" },
      deploying: { color: "primary", label: "Deploying" },
      ready: { color: "success", label: "Ready" },
      completed: { color: "success", label: "Completed" },
      error: { color: "danger", label: "Error" },
      canceled: { color: "neutral", label: "Canceled" }
    };
    const statusInfo = statusMap[status?.toLowerCase()] || { color: "neutral", label: status || "Unknown" };
    return /* @__PURE__ */ jsxRuntime.jsx(designSystem.Badge, { active: isDeploying, textColor: statusInfo.color, children: statusInfo.label });
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(admin.Layouts.Root, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      admin.Layouts.Header,
      {
        title: "Deployments",
        subtitle: "Trigger and monitor your Vercel deployments",
        primaryAction: hasWebhook && /* @__PURE__ */ jsxRuntime.jsx(
          designSystem.Button,
          {
            onClick: handleDeploy,
            loading: isDeploying,
            disabled: isDeploying,
            startIcon: /* @__PURE__ */ jsxRuntime.jsx(icons.Play, {}),
            size: "L",
            variant: "default",
            children: isDeploying ? "Deploying..." : "Deploy to Vercel"
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs(admin.Layouts.Content, { children: [
      notification && /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingBottom: 4, children: /* @__PURE__ */ jsxRuntime.jsx(
        designSystem.Alert,
        {
          closeLabel: "Close",
          title: notification.message,
          variant: notification.type,
          onClose: () => setNotification(null)
        }
      ) }),
      !hasWebhook && /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingBottom: 4, children: /* @__PURE__ */ jsxRuntime.jsx(
        designSystem.Alert,
        {
          title: "Webhook not configured",
          variant: "warning",
          children: "Please configure your Vercel deployment webhook in the settings before triggering deployments."
        }
      ) }),
      /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { direction: "column", alignItems: "stretch", gap: 4, children: [
        deploymentStatus && /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Card, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.CardHeader, { children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.CardTitle, { children: "Current Deployment" }) }),
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.CardBody, { children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.CardContent, { children: /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { direction: "column", alignItems: "stretch", gap: 3, children: [
            /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { justifyContent: "space-between", alignItems: "center", children: [
              /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "sigma", children: "Status" }),
              getStatusBadge(deploymentStatus.status)
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { justifyContent: "space-between", alignItems: "center", children: [
              /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "sigma", children: "Started" }),
              /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "pi", children: new Date(deploymentStatus.startedAt).toLocaleString() })
            ] }),
            deploymentStatus.completedAt && /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { justifyContent: "space-between", alignItems: "center", children: [
              /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "sigma", children: "Completed" }),
              /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "pi", children: new Date(deploymentStatus.completedAt).toLocaleString() })
            ] }),
            deploymentStatus.vercelUrl && /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { justifyContent: "space-between", alignItems: "center", children: [
              /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "sigma", children: "Deployment URL" }),
              /* @__PURE__ */ jsxRuntime.jsx("a", { href: deploymentStatus.vercelUrl, target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Typography, { variant: "pi", textColor: "primary600", children: [
                "View on Vercel ",
                /* @__PURE__ */ jsxRuntime.jsx(icons.ArrowUp, {})
              ] }) })
            ] })
          ] }) }) })
        ] }),
        (isDeploying || logs.length > 0) && /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Card, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.CardHeader, { children: /* @__PURE__ */ jsxRuntime.jsxs(designSystem.CardTitle, { children: [
            "Deployment Logs",
            isDeploying && /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingLeft: 2, display: "inline-block", children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Loader, { small: true }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.CardBody, { children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.CardContent, { children: /* @__PURE__ */ jsxRuntime.jsx(
            designSystem.Box,
            {
              background: "neutral800",
              hasRadius: true,
              padding: 4,
              style: {
                fontFamily: "monospace",
                fontSize: "12px",
                maxHeight: "400px",
                overflowY: "auto"
              },
              children: logs.length > 0 ? logs.map((log, index) => /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingBottom: 1, children: /* @__PURE__ */ jsxRuntime.jsxs(
                designSystem.Typography,
                {
                  variant: "pi",
                  textColor: log.type === "error" ? "danger500" : log.type === "warning" ? "warning500" : "neutral0",
                  children: [
                    "[",
                    new Date(log.timestamp).toLocaleTimeString(),
                    "] ",
                    log.message
                  ]
                }
              ) }, index)) : /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "pi", textColor: "neutral300", children: "Waiting for deployment logs..." })
            }
          ) }) })
        ] }),
        !deploymentStatus && !isDeploying && /* @__PURE__ */ jsxRuntime.jsx(designSystem.Card, { children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.CardBody, { justifyContent: "center", children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.CardContent, { children: /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { direction: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: 6, children: [
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "alpha", textColor: "neutral600", textAlign: "center", children: "No active deployments" }),
          /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Typography, { variant: "epsilon", textColor: "neutral600", textAlign: "center", children: [
            'Click the "Deploy to Vercel" button to trigger a new deployment.',
            !hasWebhook && " But first, configure your webhook in settings."
          ] })
        ] }) }) }) })
      ] })
    ] })
  ] });
};
const App = () => {
  return /* @__PURE__ */ jsxRuntime.jsxs(reactRouterDom.Routes, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(reactRouterDom.Route, { index: true, element: /* @__PURE__ */ jsxRuntime.jsx(Deployment, {}) }),
    /* @__PURE__ */ jsxRuntime.jsx(reactRouterDom.Route, { path: "settings", element: /* @__PURE__ */ jsxRuntime.jsx(Settings.default, {}) }),
    /* @__PURE__ */ jsxRuntime.jsx(reactRouterDom.Route, { path: "*", element: /* @__PURE__ */ jsxRuntime.jsx(admin.Page.Error, {}) })
  ] });
};
exports.App = App;
