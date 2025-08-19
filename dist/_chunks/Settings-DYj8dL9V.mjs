import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { useFetchClient, Layouts } from "@strapi/strapi/admin";
import { Button, Box, Alert, Flex, TextInput, Typography } from "@strapi/design-system";
import { Check } from "@strapi/icons";
const Settings = () => {
  const { formatMessage } = useIntl();
  const { get, put } = useFetchClient();
  const [settings, setSettings] = useState({
    webhookUrl: "",
    vercelToken: "",
    projectId: "",
    teamId: ""
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  useEffect(() => {
    fetchSettings();
  }, []);
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await get("/strapi-content-deployment/settings");
      setSettings(data.data || { webhookUrl: "", vercelToken: "", projectId: "", teamId: "" });
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
      console.log("Saving settings:", settings);
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
  return /* @__PURE__ */ jsxs(Layouts.Root, { children: [
    /* @__PURE__ */ jsx(
      Layouts.Header,
      {
        title: "Deployment Settings",
        subtitle: "Configure your Vercel deployment webhook and credentials",
        primaryAction: /* @__PURE__ */ jsx(
          Button,
          {
            onClick: handleSave,
            loading: saving,
            disabled: loading || !settings.webhookUrl,
            startIcon: /* @__PURE__ */ jsx(Check, {}),
            size: "L",
            children: "Save Settings"
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
      /* @__PURE__ */ jsx(
        Box,
        {
          background: "neutral0",
          hasRadius: true,
          shadow: "filterShadow",
          paddingTop: 6,
          paddingBottom: 6,
          paddingLeft: 7,
          paddingRight: 7,
          children: /* @__PURE__ */ jsxs(Flex, { direction: "column", alignItems: "stretch", gap: 4, children: [
            /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(
              TextInput,
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
            /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(
              TextInput,
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
            /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(
              TextInput,
              {
                label: "Vercel Project ID (Optional)",
                name: "projectId",
                hint: "Required for real-time deployment status. Found in Vercel project settings",
                placeholder: "prj_xxxxxxxxxxxx",
                value: settings.projectId,
                onChange: handleChange("projectId")
              }
            ) }),
            /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(
              TextInput,
              {
                label: "Vercel Team ID (Optional)",
                name: "teamId",
                hint: "Required if your project is under a team. Found in Vercel team settings URL",
                placeholder: "team_xxxxxxxxxxxx or slug name",
                value: settings.teamId,
                onChange: handleChange("teamId")
              }
            ) }),
            /* @__PURE__ */ jsx(Box, { paddingTop: 4, children: /* @__PURE__ */ jsx(Typography, { variant: "pi", textColor: "neutral600", children: "Note: Vercel Token and Project ID are optional but required for real-time deployment status tracking. Without them, deployments will still trigger but you won't see live progress updates." }) })
          ] })
        }
      )
    ] })
  ] });
};
export {
  Settings as default
};
