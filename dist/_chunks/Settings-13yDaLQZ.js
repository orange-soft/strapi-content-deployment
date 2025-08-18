"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const react = require("react");
const reactIntl = require("react-intl");
const admin = require("@strapi/strapi/admin");
const designSystem = require("@strapi/design-system");
const icons = require("@strapi/icons");
const Settings = () => {
  const { formatMessage } = reactIntl.useIntl();
  const { get, put } = admin.useFetchClient();
  const [settings, setSettings] = react.useState({
    webhookUrl: "",
    vercelToken: "",
    projectId: ""
  });
  const [loading, setLoading] = react.useState(false);
  const [saving, setSaving] = react.useState(false);
  const [notification, setNotification] = react.useState(null);
  react.useEffect(() => {
    fetchSettings();
  }, []);
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await get("/strapi-content-deployment/settings");
      setSettings(data.data || { webhookUrl: "", vercelToken: "", projectId: "" });
    } catch (error) {
      console.error("Error fetching settings:", error);
      setNotification({
        type: "danger",
        message: "Failed to load settings"
      });
    }
    setLoading(false);
  };
  const handleSave = async () => {
    if (!settings.webhookUrl) {
      setNotification({
        type: "warning",
        message: "Webhook URL is required"
      });
      return;
    }
    setSaving(true);
    try {
      await put("/strapi-content-deployment/settings", settings);
      setNotification({
        type: "success",
        message: "Settings saved successfully"
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      setNotification({
        type: "danger",
        message: "Failed to save settings"
      });
    }
    setSaving(false);
  };
  const handleChange = (field) => (e) => {
    setSettings({
      ...settings,
      [field]: e.target.value
    });
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(admin.Layouts.Root, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      admin.Layouts.Header,
      {
        title: "Deployment Settings",
        subtitle: "Configure your Vercel deployment webhook and credentials",
        primaryAction: /* @__PURE__ */ jsxRuntime.jsx(
          designSystem.Button,
          {
            onClick: handleSave,
            loading: saving,
            disabled: loading || !settings.webhookUrl,
            startIcon: /* @__PURE__ */ jsxRuntime.jsx(icons.Check, {}),
            size: "L",
            children: "Save Settings"
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
      /* @__PURE__ */ jsxRuntime.jsx(
        designSystem.Box,
        {
          background: "neutral0",
          hasRadius: true,
          shadow: "filterShadow",
          paddingTop: 6,
          paddingBottom: 6,
          paddingLeft: 7,
          paddingRight: 7,
          children: /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { direction: "column", alignItems: "stretch", gap: 4, children: [
            /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { children: /* @__PURE__ */ jsxRuntime.jsx(
              designSystem.TextInput,
              {
                label: "Vercel Deployment Webhook URL",
                name: "webhookUrl",
                hint: "The webhook URL from your Vercel project settings",
                placeholder: "https://api.vercel.com/v1/integrations/deploy/...",
                value: settings.webhookUrl,
                onChange: handleChange("webhookUrl"),
                required: true
              }
            ) }),
            /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { children: /* @__PURE__ */ jsxRuntime.jsx(
              designSystem.TextInput,
              {
                label: "Vercel Token (Optional)",
                name: "vercelToken",
                hint: "Required for real-time deployment status. Get it from Vercel account settings",
                placeholder: "Bearer token from Vercel",
                value: settings.vercelToken,
                onChange: handleChange("vercelToken"),
                type: "password"
              }
            ) }),
            /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { children: /* @__PURE__ */ jsxRuntime.jsx(
              designSystem.TextInput,
              {
                label: "Vercel Project ID (Optional)",
                name: "projectId",
                hint: "Required for real-time deployment status. Found in Vercel project settings",
                placeholder: "prj_xxxxxxxxxxxx",
                value: settings.projectId,
                onChange: handleChange("projectId")
              }
            ) }),
            /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingTop: 4, children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "pi", textColor: "neutral600", children: "Note: Vercel Token and Project ID are optional but required for real-time deployment status tracking. Without them, deployments will still trigger but you won't see live progress updates." }) })
          ] })
        }
      )
    ] })
  ] });
};
exports.default = Settings;
