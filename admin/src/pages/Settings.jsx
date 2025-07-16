import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useFetchClient, Layouts } from '@strapi/strapi/admin';
import {
  Box,
  TextInput,
  Button,
  Flex,
  Typography,
  Alert,
} from '@strapi/design-system';
import { Check } from '@strapi/icons';

const Settings = () => {
  const { formatMessage } = useIntl();
  const { get, put } = useFetchClient();
  const [settings, setSettings] = useState({
    webhookUrl: '',
    vercelToken: '',
    projectId: '',
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
      const { data } = await get('/api/strapi-content-deployment/settings');
      setSettings(data.data || { webhookUrl: '', vercelToken: '', projectId: '' });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setNotification({
        type: 'danger',
        message: 'Failed to load settings',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings.webhookUrl) {
      setNotification({
        type: 'warning',
        message: 'Webhook URL is required',
      });
      return;
    }

    setSaving(true);
    try {
      await put('/api/strapi-content-deployment/settings', settings);
      setNotification({
        type: 'success',
        message: 'Settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setNotification({
        type: 'danger',
        message: 'Failed to save settings',
      });
    }
    setSaving(false);
  };

  const handleChange = (field) => (e) => {
    setSettings({
      ...settings,
      [field]: e.target.value,
    });
  };

  return (
    <Layouts.Root>
      <Layouts.Header
        title="Deployment Settings"
        subtitle="Configure your Vercel deployment webhook and credentials"
        primaryAction={
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={loading || !settings.webhookUrl}
            startIcon={<Check />}
            size="L"
          >
            Save Settings
          </Button>
        }
      />
      <Layouts.Content>
          {notification && (
            <Box paddingBottom={4}>
              <Alert
                closeLabel="Close"
                title={notification.message}
                variant={notification.type}
                onClose={() => setNotification(null)}
              />
            </Box>
          )}
          
          <Box
            background="neutral0"
            hasRadius
            shadow="filterShadow"
            paddingTop={6}
            paddingBottom={6}
            paddingLeft={7}
            paddingRight={7}
          >
            <Flex direction="column" alignItems="stretch" gap={4}>
              <Box>
                <TextInput
                  label="Vercel Deployment Webhook URL"
                  name="webhookUrl"
                  hint="The webhook URL from your Vercel project settings"
                  placeholder="https://api.vercel.com/v1/integrations/deploy/..."
                  value={settings.webhookUrl}
                  onChange={handleChange('webhookUrl')}
                  required
                />
              </Box>
              
              <Box>
                <TextInput
                  label="Vercel Token (Optional)"
                  name="vercelToken"
                  hint="Required for real-time deployment status. Get it from Vercel account settings"
                  placeholder="Bearer token from Vercel"
                  value={settings.vercelToken}
                  onChange={handleChange('vercelToken')}
                  type="password"
                />
              </Box>
              
              <Box>
                <TextInput
                  label="Vercel Project ID (Optional)"
                  name="projectId"
                  hint="Required for real-time deployment status. Found in Vercel project settings"
                  placeholder="prj_xxxxxxxxxxxx"
                  value={settings.projectId}
                  onChange={handleChange('projectId')}
                />
              </Box>
              
              <Box paddingTop={4}>
                <Typography variant="pi" textColor="neutral600">
                  Note: Vercel Token and Project ID are optional but required for real-time deployment status tracking.
                  Without them, deployments will still trigger but you won't see live progress updates.
                </Typography>
              </Box>
            </Flex>
          </Box>
      </Layouts.Content>
    </Layouts.Root>
  );
};

export default Settings;