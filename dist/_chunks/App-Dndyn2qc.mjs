import { jsxs, jsx } from "react/jsx-runtime";
import { useFetchClient, Layouts, Page } from "@strapi/strapi/admin";
import { Routes, Route } from "react-router-dom";
import { Button, Box, Alert, Flex, Card, CardHeader, CardTitle, CardBody, CardContent, Typography, Loader, Badge } from "@strapi/design-system";
import { useIntl } from "react-intl";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import { Play, ArrowUp } from "@strapi/icons";
import Settings from "./Settings-DYj8dL9V.mjs";
const Deployment = () => {
  const { formatMessage } = useIntl();
  const { get, post } = useFetchClient();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [notification, setNotification] = useState(null);
  const [socket, setSocket] = useState(null);
  const [hasWebhook, setHasWebhook] = useState(true);
  useEffect(() => {
    checkWebhookConfiguration();
    const newSocket = io(window.location.origin);
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
    return /* @__PURE__ */ jsx(Badge, { active: isDeploying, textColor: statusInfo.color, children: statusInfo.label });
  };
  return /* @__PURE__ */ jsxs(Layouts.Root, { children: [
    /* @__PURE__ */ jsx(
      Layouts.Header,
      {
        title: "Deployments",
        subtitle: "Trigger and monitor your Vercel deployments",
        primaryAction: hasWebhook && /* @__PURE__ */ jsx(
          Button,
          {
            onClick: handleDeploy,
            loading: isDeploying,
            disabled: isDeploying,
            startIcon: /* @__PURE__ */ jsx(Play, {}),
            size: "L",
            variant: "default",
            children: isDeploying ? "Deploying..." : "Deploy to Vercel"
          }
        )
      }
    ),
    /* @__PURE__ */ jsxs(Layouts.Content, { children: [
      notification && /* @__PURE__ */ jsx(Box, { paddingBottom: 4, children: /* @__PURE__ */ jsx(
        Alert,
        {
          closeLabel: "Close",
          title: notification.message,
          variant: notification.type,
          onClose: () => setNotification(null)
        }
      ) }),
      !hasWebhook && /* @__PURE__ */ jsx(Box, { paddingBottom: 4, children: /* @__PURE__ */ jsx(
        Alert,
        {
          title: "Webhook not configured",
          variant: "warning",
          children: "Please configure your Vercel deployment webhook in the settings before triggering deployments."
        }
      ) }),
      /* @__PURE__ */ jsxs(Flex, { direction: "column", alignItems: "stretch", gap: 4, children: [
        deploymentStatus && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Current Deployment" }) }),
          /* @__PURE__ */ jsx(CardBody, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Flex, { direction: "column", alignItems: "stretch", gap: 3, children: [
            /* @__PURE__ */ jsxs(Flex, { justifyContent: "space-between", alignItems: "center", children: [
              /* @__PURE__ */ jsx(Typography, { variant: "sigma", children: "Status" }),
              getStatusBadge(deploymentStatus.status)
            ] }),
            /* @__PURE__ */ jsxs(Flex, { justifyContent: "space-between", alignItems: "center", children: [
              /* @__PURE__ */ jsx(Typography, { variant: "sigma", children: "Started" }),
              /* @__PURE__ */ jsx(Typography, { variant: "pi", children: new Date(deploymentStatus.startedAt).toLocaleString() })
            ] }),
            deploymentStatus.completedAt && /* @__PURE__ */ jsxs(Flex, { justifyContent: "space-between", alignItems: "center", children: [
              /* @__PURE__ */ jsx(Typography, { variant: "sigma", children: "Completed" }),
              /* @__PURE__ */ jsx(Typography, { variant: "pi", children: new Date(deploymentStatus.completedAt).toLocaleString() })
            ] }),
            deploymentStatus.vercelUrl && /* @__PURE__ */ jsxs(Flex, { justifyContent: "space-between", alignItems: "center", children: [
              /* @__PURE__ */ jsx(Typography, { variant: "sigma", children: "Deployment URL" }),
              /* @__PURE__ */ jsx("a", { href: deploymentStatus.vercelUrl, target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsxs(Typography, { variant: "pi", textColor: "primary600", children: [
                "View on Vercel ",
                /* @__PURE__ */ jsx(ArrowUp, {})
              ] }) })
            ] })
          ] }) }) })
        ] }),
        (isDeploying || logs.length > 0) && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { children: [
            "Deployment Logs",
            isDeploying && /* @__PURE__ */ jsx(Box, { paddingLeft: 2, display: "inline-block", children: /* @__PURE__ */ jsx(Loader, { small: true }) })
          ] }) }),
          /* @__PURE__ */ jsx(CardBody, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(
            Box,
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
              children: logs.length > 0 ? logs.map((log, index) => /* @__PURE__ */ jsx(Box, { paddingBottom: 1, children: /* @__PURE__ */ jsxs(
                Typography,
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
              ) }, index)) : /* @__PURE__ */ jsx(Typography, { variant: "pi", textColor: "neutral300", children: "Waiting for deployment logs..." })
            }
          ) }) })
        ] }),
        !deploymentStatus && !isDeploying && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardBody, { justifyContent: "center", children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Flex, { direction: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: 6, children: [
          /* @__PURE__ */ jsx(Typography, { variant: "alpha", textColor: "neutral600", textAlign: "center", children: "No active deployments" }),
          /* @__PURE__ */ jsxs(Typography, { variant: "epsilon", textColor: "neutral600", textAlign: "center", children: [
            'Click the "Deploy to Vercel" button to trigger a new deployment.',
            !hasWebhook && " But first, configure your webhook in settings."
          ] })
        ] }) }) }) })
      ] })
    ] })
  ] });
};
const App = () => {
  return /* @__PURE__ */ jsxs(Routes, { children: [
    /* @__PURE__ */ jsx(Route, { index: true, element: /* @__PURE__ */ jsx(Deployment, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "settings", element: /* @__PURE__ */ jsx(Settings, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "*", element: /* @__PURE__ */ jsx(Page.Error, {}) })
  ] });
};
export {
  App
};
